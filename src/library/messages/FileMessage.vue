<template>
  <div
    class="file-message"
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
      class="file-message__avatar"
      :src="message.avatar"
      height="32"
      width="32"
      :style="{ gridRow: message.subText ? '2' : '1' }"
    >

    <p
      v-if="message.subText && isFirstInSeries"
      class="file-message__subtext"
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
      class="file-message__content"
      :class="{ 'is-first': isFirstInSeries, 'with-avatar-indent': !isFirstInSeries && message.avatar }"
      :style="{ gridRow: message.subText ? '2' : '1' }"
      @mouseenter="showMenu"
    >
      <BaseReplyMessage
        v-if="message.reply"
        :message="message.reply"
        :class="message.position"
        @reply="handleClickReplied"
      />
      <a
        class="file-message__link"
        :href="message.url"
        download
        target="_blank"
      >
        <span class="pi pi-file" />
        <p class="file-message__filename-text">
          {{ message.filename }}
        </p>
        <div class="file-message__download-button">
          <span class="pi pi-download" />
        </div>
      </a>
      <div
        v-if="message.text"
        class="file-message__text-container"
      >
        <p
          @click="inNewWindow"
          v-html="linkedText"
        />
      </div>

      <LinkPreview
        v-if="message.linkPreview"
        :class="message.position"
        :link-preview="message.linkPreview"
      />

      <EmbedPreview
        v-if="message.embed"
        :class="message.position"
        :embed="message.embed"
      />

      <div class="file-message__info-container">
        <div
          v-if="message.views"
          class="file-message__views"
          @click="viewsAction"
        >
          <span class="pi pi-eye" />
          <p>{{ message.views }}</p>
        </div>

        <span class="file-message__time">{{ message.time }}</span>

        <div
          v-if="getClass(message) === 'file-message__right' && statuses.includes(message.status)"
          class="file-message__status"
          :class="status"
        >
          <span
            v-if="message.status !== 'sent'"
            class="pi pi-check"
          />
          <span class="pi pi-check" />
        </div>
      </div>

      <button
        v-if="buttonMenuVisible && message.actions"
        class="file-message__menu-button"
        @click="isOpenMenu = !isOpenMenu"
      >
        <span class="pi pi-ellipsis-h" />
      </button>

      <transition>
        <ContextMenu
          v-if="isOpenMenu && message.actions"
          class="file-message__context-menu"
          :actions="message.actions"
          @click="clickAction"
        />
      </transition>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { computed, ref, watch } from 'vue'
import linkifyStr from "linkify-string";


import { ContextMenu } from '../components'
import Tooltip from '../components/Tooltip.vue';

import { getStatus, statuses } from "../../helpers";

import { IFileMessage } from '../../types'
import BaseReplyMessage from './BaseReplyMessage.vue'
import LinkPreview from './LinkPreview.vue'
import EmbedPreview from './EmbedPreview.vue';

// Define props
const props = defineProps({
  message: {
    type: Object as () => IFileMessage,
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

const emit = defineEmits(['action','reply']);

const isOpenMenu = ref(false)
const buttonMenuVisible = ref(false);
const linkedText = ref('')

// Computed property for channel info from tooltip data
const channelInfo = computed(() => {
  if (props.subtextTooltipData && props.subtextTooltipData[props.message.messageId]) {
    return props.subtextTooltipData[props.message.messageId]
  }
  return props.message.subText || ''
})

watch(
  () => props.message.text,
  () => {
    if (props.message.text) {
      linkedText.value = linkifyStr(props.message.text)
    }
  },
  { immediate: true }
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
};

const hideMenu = () => {
  buttonMenuVisible.value = false;
  isOpenMenu.value = false
};

const status = computed(() => getStatus(props.message.status))

function getClass(message) {
  return message.position === 'left' ? 'file-message__left' : 'file-message__right';
}

</script>

<style
  scoped
  lang="scss"
>
.file-message {

  &__content {
    position: relative;
    width: fit-content;
    border-radius: var(--chotto-message-border-radius, 14px);
    padding: 10px 10px 4px 16px;;
    max-width: 25rem;
  }

  &__left .file-message__content.is-first::before {
    content: '';
    position: absolute;
    top: 0;
    left: -8px;
    width: 0;
    height: 0;
    border: 20px solid transparent;
    border-top: 15px solid var(--chotto-message-left-bg);
    z-index: 1;
  }

  &__right .file-message__content.is-first::after {
    content: '';
    position: absolute;
    top: 0;
    right: -8px;
    width: 0;
    height: 0;
    border: 20px solid transparent;
    border-top: 15px solid var(--chotto-message-right-bg);
    z-index: 1;
  }

  &__avatar {
    align-self: auto;
    object-fit: cover;
    min-width: var(--chotto-avatar-small);
    min-height: var(--chotto-avatar-small);
    border-radius: var(--chotto-avatar-border-radius);
  }

  &__subtext {
    font-size: var(--chotto-additional-text-font-size);
    color: var(--chotto-secondary-text-color);
    cursor: pointer;
  }

  &__text-container {
    margin-top: 6px;
    word-wrap: break-word;

    p {
      white-space: pre-wrap;
      font-size: var(--chotto-text-font-size);
    }
  }

  &__link {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    column-gap: 12px;

    span {
      color: var(--chotto-secondary-text-color);
      font-size: var(--chotto-button-icon-size);
    }
  }

  &__filename-text {
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    margin-right: 40px;
    font-size: var(--chotto-text-font-size);
    color: var(--chotto-primary-text-color);
  }

  &__info-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    column-gap: 2px;
  }

  &__download-button {
    margin-bottom: 5px;
    border: none;
    border-radius: 12px;
    background-color: transparent;
    padding: 0;
    cursor: pointer;

    span {
      color: var(--chotto-secondary-text-color);
      font-size: var(--chotto-text-icon-size);
    }
  }

  &__status {
    display: flex;

    span {
      color: var(--chotto-status-color-received);
      font-size: var(--chotto-small-text-icon-size);
      font-weight: 400;
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

  &__views {
    display: flex;
    align-items: center;
    column-gap: 4px;

    span {
      font-size: var(--chotto-small-text-icon-size);
      color: var(--chotto-secondary-text-color);
    }

    p {
      font-size: var(--chotto-small-text-font-size);
      color: var(--chotto-secondary-text-color);
    }
  }

  &__time {
    font-size: var(--chotto-text-font-size);
    color: var(--chotto-secondary-text-color);
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

  &__left,
  &__right {
    display: grid;
    margin: var(--chotto-message-margin);
  }

  &__left {
    grid-template-columns: min-content 1fr;

    .file-message__avatar {
      grid-column: 1;
      margin-right: 12px;
    }

    .file-message__subtext {
      grid-column: 2;
      grid-row: 1;
      margin: 0 0 2px 10px;
    }

    .file-message__content {
      grid-column: 2;
      background-color: var(--chotto-message-left-bg);
    }

    .file-message__content.with-avatar-indent {
      margin-left: calc(var(--chotto-avatar-small) + 12px);
    }

    .file-message__menu-button {
      top: 50%;
      right: -40px;
    }

    .file-message__context-menu {
      top: 50%;
      left: 100%;
      margin-top: 20px;
    }

  }

  &__right {
    grid-template-columns: 1fr min-content;

    .file-message__avatar {
      grid-column: 2;
      margin-left: 12px;
    }

    .file-message__subtext {
      grid-column: 1;
      grid-row: 1;
      margin: 0 10px 2px auto;
    }

    .file-message__content {
      grid-column: 1;
      margin-left: auto;
      background-color: var(--chotto-message-right-bg);
    }

    .file-message__content.with-avatar-indent {
      margin-right: calc(var(--chotto-avatar-small) + 12px);
    }

    .file-message__menu-button {
      top: 50%;
      left: -40px;
    }

    .file-message__context-menu {
      top: 50%;
      right: 100%;
      margin-top: 20px;
    }
  }
}

.v-enter-active {
  transition: all 0.1s ease-out;
}

.v-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.v-enter-from,
.v-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
