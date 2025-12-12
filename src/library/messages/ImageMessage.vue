<template>
  <div
    class="image-message"
    :class="[
      getClass(message),
      applyStyle(message)
    ]"
    :messageId="message.messageId"
    :style="message.position === 'right' && message.backgroundColor ? {'--chotto-message-right-bg': message.backgroundColor} : null"
    @mouseleave="hideMenu"
  >
    <img
      v-if="message.avatar && isFirstInSeries"
      class="image-message__avatar"
      :src="message.avatar"
      height="32"
      width="32"
    >

    <p
      v-if="message.subText && isFirstInSeries"
      class="image-message__subtext"
    >
      <Tooltip
        :text="channelInfo"
        :position="message.position === 'left' ? 'right' : 'left'"
        :offset="8"
      >
        {{ message.subText }}
      </Tooltip>
    </p>

    <div
      class="image-message__content"
      :class="{ 'is-first': isFirstInSeries, 'with-avatar-indent': !isFirstInSeries && message.avatar }"
    >
      <BaseReplyMessage
        v-if="message.reply"
        style="margin: 10px 10px 4px 16px;"
        :class="message.position"
        :message="message.reply"
        @reply="handleClickReplied"
      />

      <div
        class="image-message__preview-button"
        :class="{ 'image-message__preview-button--blur-edges': shouldApplyBlur }"
        @click="isOpenModal = true"
        @mouseenter="showMenu"
        @mouseleave="hideMenu"
      >
        <div
          v-if="shouldApplyBlur"
          class="image-message__blur-wrapper"
        >
          <img
            class="image-message__blur-left"
            :src="message.url"
            :alt="message.alt"
          >
          <img
            class="image-message__blur-right"
            :src="message.url"
            :alt="message.alt"
          >
        </div>
        <img
          ref="imageRef"
          class="image-message__preview-image"
          :style="{ borderRadius: imageBorderRadius }"
          :src="message.url"
          :alt="message.alt"
        >

        <transition name="modal-fade">
          <div
            v-if="buttonDownloadVisible"
            class="image-message__info-container"
          >
            <div
              v-if="message.views"
              class="image-message__views"
              @click.stop="viewsAction"
            >
              <span class="pi pi-eye" />
              <p>{{ message.views }}</p>
            </div>

            <span class="image-message__time">{{ message.time }}</span>

            <MessageStatusIndicator
              base-class="image-message"
              :message-class="getClass(message)"
              :message-status="message.status"
              :status-class="status"
              :status-title="statusTitle"
            />
          </div>
        </transition>

        <transition name="modal-fade">
          <a
            v-if="buttonDownloadVisible"
            class="image-message__download-button"
            :href="message.url"
            download
            target="_blank"
            @click.stop="() => '//Предотвращаем всплытие события клика'"
          >
            <span class="pi pi-download" />
          </a>
        </transition>
      </div>

      <transition name="modal-fade">
        <button
          v-if="buttonMenuVisible && message.actions"
          class="image-message__menu-button"
          @click="isOpenMenu = !isOpenMenu"
        >
          <span class="pi pi-ellipsis-h" />
        </button>
      </transition>


      <transition name="context-menu">
        <ContextMenu
          v-if="isOpenMenu && message.actions"
          class="image-message__context-menu"
          :actions="message.actions"
          @click="clickAction"
        />
      </transition>

      <div
        v-if="message.text"
        ref="textRef"
        class="image-message__text-container"
      >
        <p
          @click="inNewWindow"
          v-html="linkedText"
        />
      </div>

      <LinkPreview
        v-if="message.linkPreview"
        class="image-message__link-preview"
        :class="message.position"
        :link-preview="message.linkPreview"
      />

      <EmbedPreview
        v-if="message.embed"
        :class="message.position"
        :embed="message.embed"
      />
    </div>


    <Teleport to="body">
      <transition name="modal-fade">
        <ModalFullscreen
          v-if="isOpenModal"
          :data-theme="getTheme().theme ? getTheme().theme : 'light'"
          @close="closeModal"
        >
          <img
            class="image-message__modal-image"
            :src="message.url"
            :alt="message.alt"
          >
        </ModalFullscreen>
      </transition>
    </Teleport>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { ref, computed, watch, inject, onMounted, onUnmounted, nextTick } from 'vue';
import linkifyStr from "linkify-string";

import { ContextMenu } from '../components'
import { getStatus, getStatusTitle } from "../../helpers";
import MessageStatusIndicator from './MessageStatusIndicator.vue';
import { IImageMessage } from '../../types';
import BaseReplyMessage from './BaseReplyMessage.vue'
import LinkPreview from './LinkPreview.vue'
import Tooltip from '../components/Tooltip.vue';
import EmbedPreview from './EmbedPreview.vue';
import ModalFullscreen from '../modals/modal-wrapper/ModalFullscreen.vue';
import { useTheme } from '../../helpers/useTheme';

const chatAppId = inject('chatAppId')

const { getTheme } = useTheme(chatAppId as string)

const props = defineProps({
  message: {
    type: Object as () => IImageMessage,
    required: true,
  },
  applyStyle: {
    type: Function,
    default: () => {return null}
  },
  isFirstInSeries: {
    type: Boolean,
    default: true
  },
  subtextTooltipData: {
    type: Object,
    required: false,
    default: () => ({})
  }
});

const emit = defineEmits(['action', 'reply']);

const isOpenModal = ref(false);

const isOpenMenu = ref(false)

// Computed property for channel info from tooltip data
const channelInfo = computed(() => {
  if (props.subtextTooltipData && props.subtextTooltipData[props.message.messageId]) {
    return props.subtextTooltipData[props.message.messageId]
  }
  return props.message.subText || ''
})
const buttonMenuVisible = ref(false);
const buttonDownloadVisible = ref(false)
const linkedText = ref('')
const imageRef = ref<HTMLImageElement | null>(null)
const textRef = ref<HTMLDivElement | null>(null)
const textWidth = ref(0)
const imageWidth = ref(0)

watch(
  () => props.message.text,
  () => {
    if (props.message.text) {
      linkedText.value = linkifyStr(props.message.text)
    }
  },
  { immediate: true }
)

watch(
  () => linkedText.value,
  () => {
    updateWidths()
    // Переподключаем ResizeObserver после изменения текста
    nextTick(() => {
      if (resizeObserver && textRef.value) {
        resizeObserver.observe(textRef.value)
      }
    })
  }
)

const handleClickReplied = (messageId) => {
  emit('reply', messageId)
}

function inNewWindow(event) {
  event.preventDefault()
  if (event.target.href)
    window.open(event.target.href, '_blank');
}

const viewsAction = () => {
  emit('action', { messageId: props.message.messageId, type: 'views' });
}

const clickAction = () => { }

const showMenu = () => {
  buttonMenuVisible.value = true;
  buttonDownloadVisible.value = true
};

const hideMenu = () => {
  buttonMenuVisible.value = false;
  buttonDownloadVisible.value = false;
  isOpenMenu.value = false
};

const updateWidths = () => {
  nextTick(() => {
    if (imageRef.value) {
      imageWidth.value = imageRef.value.offsetWidth
    }
    if (textRef.value) {
      textWidth.value = textRef.value.offsetWidth
    }
  })
}

let resizeObserver: ResizeObserver | null = null
let windowResizeHandler: (() => void) | null = null

onMounted(() => {
  updateWidths()
  
  // Обновляем размеры при изменении размера окна
  windowResizeHandler = () => updateWidths()
  window.addEventListener('resize', windowResizeHandler)
  
  // Используем ResizeObserver для отслеживания изменений размеров элементов
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      updateWidths()
    })
    
    if (imageRef.value) {
      resizeObserver.observe(imageRef.value)
    }
    if (textRef.value) {
      resizeObserver.observe(textRef.value)
    }
  }
})

onUnmounted(() => {
  if (windowResizeHandler) {
    window.removeEventListener('resize', windowResizeHandler)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(
  () => [props.message.text, props.message.url],
  () => {
    updateWidths()
    // Переподключаем ResizeObserver после изменения элементов
    nextTick(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        if (imageRef.value) {
          resizeObserver.observe(imageRef.value)
        }
        if (textRef.value) {
          resizeObserver.observe(textRef.value)
        }
      }
    })
  },
  { immediate: true }
)

const shouldApplyBlur = computed(() => {
  return props.message.text && textWidth.value > imageWidth.value && imageWidth.value > 0
})

const imageBorderRadius = computed(() => {
  if (props.message.reply && props.message.text) return '0'
  if (props.message.text) {
    // Если текст шире изображения, возвращаем '0'
    if (textWidth.value > imageWidth.value && imageWidth.value > 0) {
      return '0'
    }
    return '8px 8px 0 0'
  }
  if (props.message.reply) return '0 0 8px 8px'
  return '8px'
})

const status = computed(() => getStatus(props.message.status))
const statusTitle = computed(() => getStatusTitle(props.message.status, (props.message as IImageMessage & { statusMsg?: string }).statusMsg))

function getClass(message) {
  return message.position === 'left' ? 'image-message__left' : 'image-message__right';
}

const closeModal = () => isOpenModal.value = false

</script>

<style
  scoped
  lang="scss"
>
.image-message {

  &__content {
    position: relative;
    max-width: min(60%, 430px);
    width: fit-content;
    border-radius: 14px;
    align-items: stretch; // Растягиваем дочерние элементы по ширине
    display: flex;
    flex-direction: column;
    min-width: 0; // Позволяет контейнеру сжиматься
  }

  &__avatar {
    grid-row: 1 / -1;
    align-self: end;
    object-fit: cover;
    margin-bottom: 6px;
    min-width: var(--chotto-avatar-small);
    min-height: var(--chotto-avatar-small);
    border-radius: var(--chotto-avatar-border-radius);
  }

  &__info-container {
    position: absolute;
    right: 8px;
    bottom: 4px;
    display: flex;
    align-items: center;
    column-gap: 4px;
    border-radius: 12px;
    padding: 6px 10px;
    color: var(--chotto-message-popup-info-color);
    background-color: var(--chotto-message-popup-info-bg-color);
    z-index: 2;
  }

  &__download-button {
    position: absolute;
    left: 8px;
    bottom: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 12px;
    padding: 6px 6px;
    background-color: var(--chotto-message-popup-info-bg-color);
    cursor: pointer;
    z-index: 2;

    span {
      color: var(--chotto-message-popup-info-color);
      font-size: var(--chotto-small-text-icon-size);
    }
  }

  &__views {
    display: flex;
    align-items: center;
    column-gap: 4px;
    cursor: pointer;

    span {
      font-size: var(--chotto-small-text-icon-size);
    }

    p {
      font-size: var(--chotto-small-text-font-size);
    }
  }

  &__time {
    font-size: var(--chotto-small-text-font-size);
  }

  &__status {
    display: flex;

    span {
      color: var(--chotto-status-color-received);
      font-size: var(--chotto-small-text-icon-size);
    }
  }

  .status--received {
    span {
      color: var(--chotto-status-color-received);

      &:first-child {
        margin-right: -8px;
      }
    }
  }

  .status--read {
    span {
      color: var(--chotto-status-color-read);

      &:first-child {
        margin-right: -8px;
      }
    }
  }

  &__subtext {
    font-size: var(--chotto-additional-text-font-size);
    color: var(--chotto-secondary-text-color);
    cursor: pointer;
  }

  &__preview-button {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0;
    max-width: 430px;
    max-height: 430px;
    width: fit-content;
    height: fit-content;
    overflow: hidden;

    &--blur-edges {
      overflow: hidden;
      width: 100%;
      max-width: 100%;
      justify-content: center;
      align-items: center;
      min-height: fit-content;
      border-radius: 8px 8px 0 0;
    }
  }

  &__blur-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    display: flex;
    overflow: hidden;
    align-items: center;
  }

  &__blur-left,
  &__blur-right {
    flex: 1;
    min-width: 0;
    height: 100%;
    object-fit: cover;
    filter: blur(30px);
    opacity: 0.85;
    z-index: 0;
    transform: scale(1.2);
  }

  &__blur-left {
    object-position: left center;
  }

  &__blur-right {
    object-position: right center;
  }

  &__preview-image {
    max-height: 430px;
    max-width: 430px;
    width: 100%;
    height: auto;
    object-fit: contain;
    cursor: zoom-in;
    display: block;
    position: relative;
    z-index: 1;

    .image-message__preview-button--blur-edges & {
      width: auto;
      max-width: 430px;
      margin: 0 auto;
      flex-shrink: 0;
    }
  }

  &__modal-image {
    /*width: 100%;*/
    height: 100%;
    object-fit: contain;
    border-radius: 5px;
    max-height: 85vh;
    max-width: 95vw;
  }

  &__menu-button {
    position: absolute;
    background-color: transparent;
    border: none;
    transform: translateY(-50%);
    cursor: pointer;
    transition: 0.2s;

    span {
      color: var(--chotto-button-color-active);
      font-size: var(--chotto-button-icon-size);
    }

    &:hover span {
      color: var(--chotto-button-color-hover);
      transition: 0.2s;
    }
  }

  &__context-menu {
    position: absolute;
  }

  &__text-container {
    padding: 6px 10px 6px 10px;
    border-radius: 0 0 8px 8px;
    width: 100%;
    min-width: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;

    p {
      font-size: var(--chotto-text-font-size);
      word-break: normal;
      overflow-wrap: break-word;
      white-space: normal;
      margin: 0;
      line-height: 1.4;
    }
  }

  &__link-preview {
    margin: 8px;
  }

  &__left,
  &__right {
    display: grid;
    grid-template-rows: min-content 1fr min-content;
    margin: var(--chotto-message-margin);
  }

  &__left {
    grid-template-columns: min-content 1fr;

    .image-message__avatar {
      grid-column: 1;
      margin-right: 12px;
    }

    .image-message__subtext {
      grid-column: 2;
      grid-row: 1;
      margin: 0 0 2px 10px;
    }

    .image-message__content {
      grid-column: 2;
      background-color: var(--chotto-message-left-bg);
    }

    .image-message__content.with-avatar-indent {
      margin-left: calc(var(--chotto-avatar-small) + 12px);
    }

    .image-message__menu-button {
      top: 50%;
      right: -40px;
    }

    .image-message__context-menu {
      top: 50%;
      left: 100%;
      margin-top: 20px;
    }
  }

  &__right {
    grid-template-columns: 1fr min-content;

    .image-message__avatar {
      grid-column: 2;
      margin-left: 12px;
    }

    .image-message__subtext {
      grid-column: 1;
      grid-row: 1;
      margin: 0 10px 2px auto;
    }

    .image-message__content {
      grid-column: 1;
      margin-left: auto;
      background-color: var(--chotto-message-right-bg);
    }

    .image-message__content.with-avatar-indent {
      margin-right: calc(var(--chotto-avatar-small) + 12px);
    }

    .image-message__text-container {
      margin-left: auto;
    }

    .image-message__menu-button {
      top: 50%;
      left: -40px;
    }

    .image-message__context-menu {
      top: 50%;
      right: 100%;
      margin-top: 20px;
    }
  }
}

.context-menu-enter-active {
  transition: all 0.1s ease-out;
}

.context-menu-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.context-menu-enter-from,
.context-menu-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}
</style>
