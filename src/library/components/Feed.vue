<template>
  <div
    v-if="objects.length > 0 || typing"
    :id="'feed-container-' + chatAppId"
    ref="refFeed"
    class="message-feed"
    @scroll="throttledScrollTopCheck()"
    @mousedown="startScrollWatch"
    @mouseup="stopScrollWatch"
  >
    <transition>
      <DateMessageSticky
        v-if="showStickyDate"
        class="message-feed__sticky-date"
        :text="stickyDateText"
      />
    </transition>
    <div
      v-for="(object, index) in groupedObjects"
      :id="JSON.stringify(object)"
      :key="`${object.messageId ?? 'mid'}-${index}`"
      class="tracking-message"
      @dblclick="feedObjectDoubleClick($event,object)"
    >
      <component
        :is="componentsMap(object.type)"
        :key="`${object.messageId ?? 'mid'}-${index}`"
        class="message-feed__message"
        :message="object"
        :apply-style="applyStyle"
        :is-first-in-series="object.isFirstInSeries"
        @action="messageAction"
        @reply="handleClickReplied"
      />
    </div>
    <typing-message
      v-if="typing"
      :message="{
        subText: (typing as IFeedTyping).title,
        avatar: (typing as IFeedTyping).avatar,
      }"
    />
    <Transition>
      <MessageKeyboard
        v-if="showKeyboard"
        ref="keyboardRef"
        class="message-feed__keyboard"
        :keyboard="objects[objects.length - 1].keyboard!"
        :align="keyboardAlign"
        @action="keyboardAction"
      />
    </Transition>
    
    <transition>
      <button
        v-if="isShowButton"
        class="message-feed__button-down"
        @click="scrollToBottomForce"
      >
        <div
          v-if="buttonParams"
          class="message-feed__unread-amount"
        >
          {{ buttonParams.unreadAmount }}
        </div>
        <span class="pi pi-angle-down message-feed__icon-down" />
      </button>
    </transition>
    <FeedKeyboard
      v-if="feedKeyboards && feedKeyboards.length > 0"
      :buttons="feedKeyboards"
      :align="feedKeyboardAlign"
      @action="feedKeyboardAction"
    />
  </div>
  <div 
    v-else
    ref="refFeed"
    class="message-feed"
  >
    <div style="margin: auto;">
      <slot name="empty-feed" />
    </div>
  </div>
  <teleport
    v-if="getMessage().reply"
    :to="'#chat-input-reply-line-'+chatAppId"
  >
    <BaseReplyMessage
      class="chat-input-reply"
      :message="getMessage().reply"
      @reset="handleResetReply"
    />
  </teleport>
</template>

<script
  setup
  lang="ts"
>
import { ref, unref, watch, nextTick, inject, computed } from 'vue';
import {
  FileMessage,
  ImageMessage,
  TextMessage,
  DateMessage,
  DateMessageSticky,
  AudioMessage,
  VideoMessage,
  CallMessage,
  SystemMessage,
  TypingMessage,
  BaseReplyMessage,
  DelimiterMessage,
} from "../messages";

import { IFeedObject, IFeedTyping, IFeedUnreadButton } from '../../types';
import { throttle } from '../../helpers/throttle';
import { useMessage } from '../../helpers/useMessage';
import MessageKeyboard from './MessageKeyboard.vue';
import type { IFeedKeyboard } from '../../types/IFeedKeyboard';
import FeedKeyboard from './FeedKeyboard.vue';

const trackingObjects = ref();
const refFeed = ref();
const keyboardRef = ref();
const isShowButton = ref(false)
const isKeyboardPlace = ref(false)
const allowLoadMoreTop = ref(false)
const allowLoadMoreBottom = ref(false)
const movingDown = ref(false)
const isScrollByMouseButton = ref(false)
const showStickyDate = ref(false)
const stickyDateText = ref('')
let stickyHideTimer = null as unknown as number | null

const props = defineProps({
  objects: {
    type: Array <IFeedObject>,
    required: true,
  },
  buttonParams: {
    type: Object as () => IFeedUnreadButton,
    required: false,
  },
  // принудительный скролл вниз по событию извне (сообщение, смена чата)
  scrollToBottom: {
    type: Boolean,
    default: false,
  },
  typing: {
    type: [Object as () => IFeedTyping, Boolean],
    default: false,
  },
  enableDoubleClickReply: {
    type: Boolean,
    default: false,
  },
  scrollTo:{
    type: String,
    default: null,
  },
  applyStyle: {
    type: Function,
    default: () => {return null}
  },
  keyboardAlign: {
    type: String as () => 'left' | 'center' | 'right',
    default: 'right',
    validator: (value: string) => ['left', 'center', 'right'].includes(value)
  },
  feedKeyboards: {
    type: Array as () => IFeedKeyboard[],
    required: false,
    default: undefined
  },
  feedKeyboardAlign: {
    type: String as () => 'left' | 'center' | 'right',
    default: 'right',
    validator: (value: string) => ['left', 'center', 'right'].includes(value)
  }
});

const chatAppId = inject('chatAppId')
const { setReply, getMessage, resetReply } = useMessage(chatAppId as string)
const emit = defineEmits([
  'messageAction',
  'loadMore', 
  'loadMoreDown',
  'messageVisible', 
  'clickRepliedMessage',
  'forceScrollToBottom',
  'keyboardAction',
  'feedAction'
]);

const showKeyboard = computed(() => {
  if (isKeyboardPlace.value && props.objects.length > 0 && props.objects[props.objects.length - 1].keyboard)
    return true
  else return false
})

const keyboardAction = (action) => {
  emit('keyboardAction', action)
}

const feedKeyboardAction = (action) => {
  emit('feedAction', action);
}

function scrollTopCheck (allowLoadMore: boolean = true) {
  const element = unref(refFeed);
  let keyboardHeight = 0
  if (keyboardRef.value){
    keyboardHeight = keyboardRef.value.refKeyboard.clientHeight
  }
  const limit = 100;
  const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

  if (scrollBottom < limit + keyboardHeight) {
    isShowButton.value = false;
    isKeyboardPlace.value = true
  } else {
    isShowButton.value = true;
    isKeyboardPlace.value = false
  }

  if (isScrollByMouseButton.value){
    if (element.scrollTop < 300){      
      movingDown.value = false
      allowLoadMoreTop.value = false
    }
    if (scrollBottom < 300){
      allowLoadMoreBottom.value = false
      movingDown.value = true
    }
  }
  else if (allowLoadMore){
    if (element.scrollTop < 300) {
      allowLoadMoreTop.value = false
    }
    if (scrollBottom < 300){
      allowLoadMoreBottom.value = false
    }
  }

  updateStickyDate();
  showStickyDate.value = true;
  if (stickyHideTimer) window.clearTimeout(stickyHideTimer as unknown as number)
  stickyHideTimer = window.setTimeout(() => {
    showStickyDate.value = false;
  }, 500);
};

watch(
  () => [allowLoadMoreBottom.value, allowLoadMoreTop.value],
  () => {
    if (!allowLoadMoreBottom.value) emit('loadMoreDown')
    if (!allowLoadMoreTop.value) emit('loadMore')
  }
)

const startScrollWatch = (event) => {
  const element = unref(refFeed);
  const isScrollbar = event.offsetX > element.clientWidth || event.offsetY > element.clientHeight;
  if (isScrollbar) {
    isScrollByMouseButton.value = true
  }
}

const stopScrollWatch = () => {
  isScrollByMouseButton.value = false
}

const throttledScrollTopCheck = throttle(() => scrollTopCheck(), 250)

// Register components
const componentsMap = (type) => {

  const r = {
    'message.text': TextMessage,
    'message.image': ImageMessage,
    'message.file': FileMessage,
    'message.audio': AudioMessage,
    'message.video': VideoMessage,
    'message.call': CallMessage,
    'message.system': SystemMessage,
    'message.delimiter': DelimiterMessage,
    'system.date': DateMessage,
    'message.typing': TypingMessage
  };
  return r[type];
}

function performScrollToBottom() {
  nextTick(function () {
    const element = unref(refFeed);
    if (!element) return;
    element.scrollTop = element.scrollHeight;

    setTimeout(() => {
      element.scrollTop = element.scrollHeight;
    }, 300);
  })
}

function scrollToBottomForce() {
  emit('forceScrollToBottom')
  performScrollToBottom()
}

watch(
  ()=> props.scrollToBottom,
  () => {
    console.log('force scroll to bottom')
    if (props.scrollToBottom)
      performScrollToBottom()
  },
  {immediate: true}
)

const messageAction = (message) => {
  emit('messageAction', message);
}

const handleClickReplied = (messageId) => {
  emit('clickRepliedMessage', messageId)
}

const feedObjectDoubleClick = (event: MouseEvent,object : IFeedObject) => {
  if (props.enableDoubleClickReply){
    event?.preventDefault()
    if (object.type.indexOf('system') == -1 && object.type.indexOf('typing') == -1){
      const previewContainer = document.getElementById('chat-input-reply-line-'+chatAppId)
      if (previewContainer){
        previewContainer.style.display = 'inherit'
      }
      setReply({
        messageId: object.messageId,
        type: object.type,
        text: object.text,
        filename: object.filename,
        url: object.url,
        header: object.header,
        callDuration: object.callDuration,
      })
    }
  }
}

const handleResetReply = () => {
  resetReply()
  const previewContainer = document.getElementById('chat-input-reply-line-'+chatAppId)
  if (previewContainer){
    previewContainer.style.display = 'none'
  }
}

const callback = (entries: Array<IntersectionObserverEntry>) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      emit('messageVisible', JSON.parse(entry.target.id))
    }
  })
}

const options = {
  root: document.getElementById('feed-container-' + chatAppId),
  rootMargin: '5px',
  threshold: 0,
}

const observer = new IntersectionObserver(callback, options)

watch(
  () => props.objects,
  () => {
    nextTick(() => {
      allowLoadMoreTop.value = true
      allowLoadMoreBottom.value = true
      scrollTopCheck(false)
      if (isScrollByMouseButton.value){
        const element = unref(refFeed);
        if (movingDown.value)
          element.scrollTop = element.scrollHeight - 400
        if (!movingDown.value)
          element.scrollTop = 400
      }
      trackingObjects.value = document.querySelectorAll('.tracking-message')
      trackingObjects.value.forEach((obj) => observer.observe(obj))
      
      if (props.scrollToBottom) {
        const element = unref(refFeed);
        if (element) {
          element.scrollTop = element.scrollHeight;
          
          setTimeout(() => {
            element.scrollTop = element.scrollHeight;
          }, 100);
        }
      }
    })
  },
  { immediate: true })

watch(
  () => props.scrollTo,
  () => {
    if (props.scrollTo){
      const elem = props.scrollTo
      let target = document.getElementById(elem)
      let list = document.getElementById('feed-container-' + chatAppId)
      if (target instanceof HTMLElement && list instanceof HTMLElement)
        list.scrollTop = target.offsetTop + target.clientHeight / 2 - list.clientHeight / 2
      document.getElementById(elem)?.children[0].classList.add('focused-message')
      setTimeout(() => {
        document.getElementById(elem)?.children[0].classList.remove('focused-message')
      }, 2000)
      
    }
  }
)

const groupedObjects = computed(() => {
  if (!props.objects || props.objects.length === 0) return []

  return props.objects.map((message, index, arr) => {
    const isSameSenderAsPrevious =
      index > 0 &&
      arr[index - 1].position === message.position &&
      arr[index - 1].header === message.header

    const prevIsGroupable =
      index > 0 &&
      !['message.system', 'message.typing'].includes(arr[index - 1].type)

    const isFirstInSeries = !isSameSenderAsPrevious || !prevIsGroupable

    return {
      ...message,
      isFirstInSeries,
    }
  })
})

function updateStickyDate() {
  const feedEl = unref(refFeed) as HTMLElement
  if (!feedEl || !trackingObjects.value) return
  const feedTop = feedEl.getBoundingClientRect().top
  let topMost: HTMLElement | null = null

  for (const el of trackingObjects.value) {
    const rect = el.getBoundingClientRect()
    if (rect.top <= feedTop + 1 && rect.bottom > feedTop) { 
      topMost = el
      break
    }
  }

  if (!topMost) {
    for (const el of trackingObjects.value) {
      const rect = el.getBoundingClientRect()
      if (rect.top >= feedTop) { topMost = el; break }
    }
  }
  if (!topMost) return
  try {
    const obj = JSON.parse(topMost.id)
    if (!obj || !obj.timestamp) return
    const d = new Date(Number(obj.timestamp) * 1000)
    stickyDateText.value = d.toLocaleDateString()
  } catch {
    // ignore
  }
}

</script>

<style
  scoped
  lang="scss"
>
.message-feed {
  height: 100%;
  max-height: inherit;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background-image: url('../../../public/chat-background.svg');
  scroll-behavior: smooth;
  padding: 10px 30px 10px 30px;
  position: relative;
  
  &__message {
    position: relative;
    transition: all 2s;
  }

  &__button-down {
    position: sticky;
    z-index: 100;
    bottom: 0;
    margin-left: auto;
    border: none;
    min-width: 46px;
    min-height: 46px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: var(--chotto-button-color-disabled);
  }

  &__keyboard {
    position: sticky;
    bottom: 0;
    max-width: 25rem;
    width: fit-content;
  }

  &__icon-down {
    font-size: var(--chotto-button-icon-size);
    color: var(--chotto-button-color-active);
  }

  &__unread-amount {
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: var(--chotto-additional-text-font-size);
    width: 22px;
    height: 22px;
    color: var(--chotto-unread-text-color);
    background-color: var(--chotto-unread-background-color);
    border-radius: 50%;
  }

  &::-webkit-scrollbar {
    width: 6px;
    background-color: var(--chotto-scrollbar-bg);
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: var(--chotto-scrollbar-thumb-bg);
  }

  &::-webkit-scrollbar-track {
    border-radius: 10px;
  }
}

.focused-message {
  background-color: color-mix(in srgb, var(--chotto-message-focused-color) 30%, transparent);
  box-shadow: 0px 0px 12px 2px color-mix(in srgb, var(--chotto-message-focused-color) 30%, transparent);
}

.v-enter-active {
  transition: all 0.1s ease-out;
}

.v-leave-active {
  transition: all 0.1s;
}

.v-enter-from,
.v-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
