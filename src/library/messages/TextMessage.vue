<template>
  <div
    class="text-message"
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
      class="text-message__avatar"
      :src="message.avatar"
      height="32"
      width="32"
      :style="{ gridRow: (message.subText && isFirstInSeries) ? '2' : '1' }"
    >

    <p
      v-if="message.subText && isFirstInSeries"
      class="text-message__subtext"
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
      class="text-message__content"
      :class="{ 'is-first': isFirstInSeries, 'with-avatar-indent': !isFirstInSeries && message.avatar }"
      @mouseenter="showMenu"
    >
      <BaseReplyMessage
        v-if="message.reply"
        :class="message.position"
        :message="message.reply"
        @reply="handleClickReplied"
      />
      <p
        class="text-message__text"
        @click="inNewWindow"
        v-html="linkedText"
      />

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

      <div class="text-message__info-container">
        <div
          v-if="message.views"
          class="text-message__views"
          @click="viewsAction"
        >
          <span class="pi pi-eye" />
          <p>{{ message.views }}</p>
        </div>
        <span
          v-if="message.time"
          class="text-message__time"
        >{{ message.time }}</span>
        <MessageStatusIndicator
          base-class="text-message"
          :message-class="getClass(message)"
          :message-status="message.status"
          :status-class="status"
          :status-title="statusTitle"
        />
      </div>

      <button
        v-if="buttonMenuVisible && message.actions"
        class="text-message__menu-button"
        @click="isOpenMenu = !isOpenMenu"
      >
        <span class="pi pi-ellipsis-h" />
      </button>

      <transition>
        <ContextMenu
          v-if="isOpenMenu && message.actions"
          class="text-message__context-menu"
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
import { getStatus, getStatusTitle } from "../../helpers";
import { ITextMessage } from '../../types';
import BaseReplyMessage from './BaseReplyMessage.vue'
import LinkPreview from './LinkPreview.vue'
import EmbedPreview from './EmbedPreview.vue';
import Tooltip from '../components/Tooltip.vue';
import MessageStatusIndicator from './MessageStatusIndicator.vue';

// Define props
const props = defineProps({
  message: {
    type: Object as () => ITextMessage,
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
    linkedText.value = linkifyStr(props.message.text)
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

const showMenu = () => {
  buttonMenuVisible.value = true;
};

const hideMenu = () => {
  buttonMenuVisible.value = false;
  isOpenMenu.value = false
};

const status = computed(() => getStatus(props.message.status))
const statusTitle = computed(() => getStatusTitle(props.message.status, (props.message as ITextMessage & { statusMsg?: string }).statusMsg))

const clickAction = (action) => {
  hideMenu();
  emit('action', { messageId: props.message.messageId, type: 'menu', ...action });
}

const viewsAction = () => {
  hideMenu();
  emit('action', { messageId: props.message.messageId, type: 'views' });
}

function getClass(message) {
  return message.position === 'left' ? 'text-message__left' : 'text-message__right';
}
</script>

<style
  scoped
  lang="scss"
>
.text-message {

  &__content {
    position: relative;
    word-wrap: break-word;
    width: fit-content;
    max-width: 25rem;
    border-radius: var(--chotto-message-border-radius, 14px);
    padding: 10px 10px 4px 16px;
  }

  &__left .text-message__content.is-first::before {
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

  &__right .text-message__content.is-first::after {
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

  &__info-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    column-gap: 4px;
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

  &__text {
    font-size: var(--chotto-text-font-size);
    white-space: pre-wrap;
  }

  &__subtext {
    font-size: var(--chotto-additional-text-font-size);
    color: var(--chotto-secondary-text-color);
    cursor: pointer;
  }

  &__avatar {
    align-self: auto;
    object-fit: cover;
    min-width: var(--chotto-avatar-small);
    min-height: var(--chotto-avatar-small);
    border-radius: var(--chotto-avatar-border-radius);
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

    .text-message__avatar {
      grid-column: 1;
      grid-row: 2;
      margin-right: 12px;
    }

    .text-message__subtext {
      grid-column: 2;
      grid-row: 1;
      margin: 0 0 2px 10px;
    }

    .text-message__content {
      grid-column: 2;
      background-color: var(--chotto-message-left-bg);
    }

    .text-message__content.with-avatar-indent {
      margin-left: calc(var(--chotto-avatar-small) + 12px);
    }

    .text-message__menu-button {
      top: 50%;
      right: -40px;
    }

    .text-message__context-menu {
      top: 56%;
      left: 100%;
    }
  }

  &__right {
    grid-template-columns: 1fr min-content;

    .text-message__avatar {
      grid-column: 2;
      grid-row: 2;
      margin-left: 12px;
    }

    .text-message__subtext {
      grid-column: 1;
      grid-row: 1;
      margin: 0 10px 2px auto;
    }

    .text-message__content {
      grid-column: 1;
      margin-left: auto;
      background-color: var(--chotto-message-right-bg);
    }

    .text-message__content.with-avatar-indent {
      margin-right: calc(var(--chotto-avatar-small) + 12px);
    }

    .text-message__menu-button {
      top: 50%;
      left: -40px;
    }

    .text-message__context-menu {
      top: 56%;
      right: 100%;
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
