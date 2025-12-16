<template>
  <div>
    <div
      ref="containerRef"
      class="chat-item__container"
      :class="getClass()"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @click="selectChat"
      @contextmenu.prevent="onRightClick"
    >
      <div class="chat-item__avatar-container">
        <span
          class="chat-item__status-user"
          :style="{ backgroundColor: props.chat.status }"
        />
        <img
          v-if="props.chat.avatar"
          :src="props.chat.avatar"
          height="48"
          width="48"
        >
        <div
          v-else
          class="chat-item__avatar-placeholder"
        >
          <AvatarIcon />
        </div>
      </div>

      <div class="chat-item__info-container">
        <Tooltip
          :text="chat.name"
          position="bottom"
        >
          <div class="chat-item__name">
            {{ chat.name }}
          </div>
        </Tooltip>
        
        <Tooltip
          :text="chat.lastMessage"
          position="bottom"
        >
          <div
            v-if="chat.lastMessage || chat.typing"
            class="chat-item__last-message"
          >
            {{ showText }}
          </div>
        </Tooltip>
      </div>

      <div class="chat-item__details-container">
        <div
          v-if="chat['lastActivity.time'] && (chat.actions ? !buttonMenuVisible : true)"
          class="chat-item__time"
        >
          {{ chat['lastActivity.time'] }}
        </div>

        <!-- Кнопка меню размещена выше статуса и индикатора -->
        <ButtonContextMenu
          v-if="buttonMenuVisible && chat.actions && contextMenuTrigger === 'hover'"
          mode="click"
          menu-side="bottom-right"
          :offset-x="-36"
          :actions="chat.actions"
          @click="clickAction"
          @button-click="BCMclick"
          @menu-mouse-leave="buttonMenuVisible = false"
        >
          <span class="pi pi-ellipsis-h chat-item__actions-trigger" />
        </ButtonContextMenu>
        
        <!-- Контекстное меню для режима rightClick -->
        <Teleport to="body">
          <ContextMenu
            v-if="contextMenuTrigger === 'rightClick' && chat.actions && contextMenuVisible"
            :id="'context-menu-rightclick-' + contextMenuId"
            :actions="chat.actions"
            :data-theme="getTheme().theme ? getTheme().theme : 'light'"
            @click="clickAction"
            @mouseenter="onContextMenuMouseEnter"
            @mouseleave="onContextMenuMouseLeave"
          />
        </Teleport>

        <!-- Контейнер для статуса и непрочитанных -->
        <div class="chat-item__status-unread-container">
          <div
            v-if="statuses.includes(chat['lastMessage.status'])"
            class="chat-item__status-message"
            :class="status"
          >
            <template v-if="chat['lastMessage.status'] === 'pending'">
              <span class="pi pi-clock" />
            </template>
            <template v-else-if="chat['lastMessage.status'] === 'error'">
              <span class="pi pi-exclamation-circle" />
            </template>
            <template v-else>
              <span
                v-if="chat['lastMessage.status'] !== 'sent'"
                class="pi pi-check"
              />
              <span class="pi pi-check" />
            </template>
          </div>

          <div
            v-if="showChatUnread"
            class="chat-item__unread"
          >
            {{ chatUnreadText }}
          </div>
        </div>

        <div
          v-if="chat.countUnread < 1"
          class="chat-item__status-chat-container"
        >
          <span
            v-if="(chat.isFixedTop || chat.isFixedBottom)"
            class="chat-item__fixed pi pi-thumbtack"
          />
        </div>
      </div>

      <div
        v-if="props.showDialogs && chat.dialogs" 
        class="chat-item__dialog-buttons"
        @click="emit('expand', props.chat)"
      >
        <button
          v-if="props.showDialogs && !chat.dialogsExpanded"
          id="noSelectButton"
          class="chat-item__menu-button"
        >
          <span
            id="noSelectButton"
            class="pi pi-angle-down"
          />
        </button>
        <button
          v-if="props.showDialogs && chat.dialogsExpanded"
          id="noSelectButton"
          class="chat-item__menu-button"
        >
          <span
            id="noSelectButton"
            class="pi pi-angle-up"
          />
        </button>
      </div>
    </div>

    <div 
      v-if="props.showDialogs && chat.dialogsExpanded"
      class="dialog__container"
      :class="{ 'dialog__container--with-scroll': props.hasScroll }"
    >
      <div
        v-for="dialog in getSortedDialogs()"
        :key="dialog.dialogId"
        class="dialog__item"
        :class="getDialogClass(dialog)"
        @click="selectDialog(dialog)"
      >
        <img
          v-if="dialog.icon"
          class="dialog__icon"
          :src="dialog.icon"
          height="16"
          width="16"
        >
        <span
          v-else
          class="dialog__icon pi pi-user"
        />
        <div class="dialog__text-container">
          <div class="dialog__name">
            {{ dialog.name }}
          </div>
          <div class="dialog__time">
            {{ dialog['lastActivity.time'] }}
          </div>
        </div>
        <div
          v-if="dialog.countUnread > 0"
          class="chat-item__unread"
          :style="{backgroundColor: dialog.colorUnread ? dialog.colorUnread : null}"
        >
          {{ dialog.countUnread > 99 ? '99+' : dialog.countUnread }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, useId, inject, nextTick} from 'vue'

import { getStatus, statuses } from "../../helpers";
import { t } from '../../locale/useLocale'
import { useTheme } from '../../helpers/useTheme'
import Tooltip from './Tooltip.vue';
import ButtonContextMenu from './ButtonContextMenu.vue';
import ContextMenu from './ContextMenu.vue';
import AvatarIcon from '../icons/AvatarIcon.vue';

const props = defineProps({
  chat: {
    type: Object,
    required: true,
  },
  showDialogs: {
    type: Boolean,
    default: true,
  },
  hasScroll: {
    type: Boolean,
    default: false,
  },
  contextMenuTrigger: {
    type: String,
    default: 'hover',
    validator: (value: string) => ['hover', 'rightClick'].includes(value),
  },
});

const emit = defineEmits(['select', 'action', 'expand']);

const chatAppId = inject('chatAppId')
const { getTheme } = useTheme(chatAppId as string)

const contextMenuId = useId()
const buttonMenuVisible = ref(false);
const contextMenuVisible = ref(false);
const preventEmit = ref(false)

const BCMclick = () => {
  preventEmit.value = true
}

const selectChat = (event: MouseEvent) => { 
  if (!preventEmit.value){
    if (event.target instanceof HTMLElement && event.target.id != 'noSelectButton')
      emit('select', {chat: props.chat, dialog: null});
  }
  preventEmit.value = false
}

const selectDialog = (dialog) => {
    emit('select', {chat: props.chat, dialog: dialog});
}

const getClass = () => {
  const classes: string[] = [];
  if (props.chat.isSelected) {
    classes.push('chat-item__selected');
  }
  if (props.hasScroll) {
    classes.push('chat-item__with-scroll');
  }
  return classes.join(' ');
}

const getDialogClass = (dialog) => {
  return dialog.isSelected ? 'dialog__selected' : ''
}

const clickAction = (action) => {
  // console.log('action', props.chat.chatId, action);
  if (props.contextMenuTrigger === 'rightClick') {
    hideContextMenu()
  }
  emit('action', { chat: props.chat, ...action });
}

const hideContextMenu = () => {
  const contextMenu = document.getElementById('context-menu-rightclick-' + contextMenuId)
  if (contextMenu) {
    contextMenu.style.top = '0'
    contextMenu.style.left = '0'
    contextMenu.style.opacity = '0'
    contextMenu.style.display = 'none'
  }
  contextMenuVisible.value = false
}

const closeAllOtherContextMenus = () => {
  // Находим все контекстные меню на странице
  const allMenus = document.querySelectorAll('[id^="context-menu-rightclick-"]')
  allMenus.forEach((menu) => {
    const menuElement = menu as HTMLElement
    if (menuElement.id !== 'context-menu-rightclick-' + contextMenuId) {
      // Закрываем все меню, кроме текущего
      menuElement.style.top = '0'
      menuElement.style.left = '0'
      menuElement.style.opacity = '0'
      menuElement.style.display = 'none'
    }
  })
}


const getSortedDialogs = () => {
  return props.chat.dialogs
    .toSorted((a, b) => {
      if (Number(a['lastActivity.timestamp']) > Number(b['lastActivity.timestamp'])) return -1;
      if (Number(a['lastActivity.timestamp']) < Number(b['lastActivity.timestamp'])) return 1;
      if (Number(a['lastActivity.timestamp']) == Number(b['lastActivity.timestamp'])) return 0;
    })
}

const status = computed(() => getStatus(props.chat['lastMessage.status']));

const showChatUnread = computed(() => {
  return props.chat.showEmptyIndicator || props.chat.countUnread > 0;
});

const chatUnreadText = computed(() => {
  if (props.chat.countUnread > 0) {
      return props.chat.countUnread > 99 ? '99+' : props.chat.countUnread;
    }
    return props.chat.showEmptyIndicator ? '' : undefined;
});

let timer;
const typingIndex = ref(0)
const typingText = [t('component.ChatItem.typing') + '.', t('component.ChatItem.typing') + '..', t('component.ChatItem.typing') + '...']

const showText = computed(() => {
  if (props.chat.typing) {
    return typingText[typingIndex.value];
  } else {
    return props.chat.lastMessage;
  }
});

watch(
  () => props.chat.typing,
  () => {
    if (props.chat.typing) {
      timer = setInterval(() => {
        if (typingIndex.value < 2) {
          typingIndex.value += 1
        }
        else {
          typingIndex.value = 0
        }
      }, 1000);
    }
    else {
      typingIndex.value = 0
      clearInterval(timer);
    }
  },
  { immediate: true }
)

const onMouseEnter = () => {
  if (props.contextMenuTrigger === 'hover') {
    buttonMenuVisible.value = true
  }
}

const onMouseLeave = (event) => {
  if (props.contextMenuTrigger === 'hover') {
    if (event.relatedTarget?.className == 'context-menu__list')
      buttonMenuVisible.value = true
    else 
      buttonMenuVisible.value = false
  }
}

const onRightClick = (event: MouseEvent) => {
  if (props.contextMenuTrigger === 'rightClick' && props.chat.actions) {
    showContextMenu(event)
  }
}

const showContextMenu = (event: MouseEvent) => {
  // Закрываем все другие открытые меню перед открытием нового
  closeAllOtherContextMenus()
  
  contextMenuVisible.value = true
  nextTick(() => {
    const contextMenu = document.getElementById('context-menu-rightclick-' + contextMenuId)
    if (contextMenu) {
      // Получаем координаты курсора
      const mouseX = event.clientX
      const mouseY = event.clientY
      
      // Получаем размеры меню для корректировки позиции
      contextMenu.style.display = 'inherit'
      const menuBounds = contextMenu.getBoundingClientRect()
      contextMenu.style.display = 'none'
      
      nextTick(() => {
        // Получаем размеры окна для проверки границ
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        const scrollX = window.scrollX || window.pageXOffset
        const scrollY = window.scrollY || window.pageYOffset
        
        // Позиционируем меню относительно курсора
        // По умолчанию меню открывается справа и снизу от курсора
        let left = mouseX + scrollX
        let top = mouseY + scrollY
        
        // Проверяем, не выходит ли меню за правую границу экрана
        if (left + menuBounds.width > windowWidth + scrollX) {
          left = mouseX + scrollX - menuBounds.width
        }
        
        // Проверяем, не выходит ли меню за нижнюю границу экрана
        if (top + menuBounds.height > windowHeight + scrollY) {
          top = mouseY + scrollY - menuBounds.height
        }
        
        // Проверяем, не выходит ли меню за левую границу экрана
        if (left < scrollX) {
          left = scrollX
        }
        
        // Проверяем, не выходит ли меню за верхнюю границу экрана
        if (top < scrollY) {
          top = scrollY
        }
        
        contextMenu.style.top = top + 'px'
        contextMenu.style.left = left + 'px'
        contextMenu.style.opacity = '1'
        contextMenu.style.display = 'inherit'
      })
    }
  })
}

const onContextMenuMouseEnter = () => {
  // Меню остается открытым при наведении
}

const onContextMenuMouseLeave = () => {
  // Меню остается открытым при уходе мыши
}

const containerRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (props.contextMenuTrigger === 'rightClick' && contextMenuVisible.value) {
    const target = event.target as HTMLElement
    const contextMenu = document.getElementById('context-menu-rightclick-' + contextMenuId)
    
    // Закрываем меню при любом клике, кроме клика на само меню (чтобы можно было выбрать пункт)
    if (!contextMenu || !contextMenu.contains(target)) {
      hideContextMenu()
    }
  }
}

const handleScroll = () => {
  // Закрываем меню при скролле
  if (props.contextMenuTrigger === 'rightClick' && contextMenuVisible.value) {
    hideContextMenu()
  }
}

onMounted(() => {
  if (props.contextMenuTrigger === 'rightClick') {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    // Инициализируем меню как скрытое
    nextTick(() => {
      const contextMenu = document.getElementById('context-menu-rightclick-' + contextMenuId)
      if (contextMenu) {
        contextMenu.style.display = 'none'
        contextMenu.style.opacity = '0'
      }
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})

</script>

<style
  scoped
  lang="scss"
>
.chat-item {

  &__container {
    grid-row: 1;
    grid-column: 1 / 2;
    display: flex;
    position: relative;
    padding: var(--chotto-chat-item-padding-container);
    cursor: pointer;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      transform: translateX(15%);
      width: var(--chotto-chat-list-container-border-bottom-width, 416px);
      height: var(--chotto-chat-list-container-border-bottom-height, 1px);
      background-color: var(--chotto-chat-list-container-border-bottom-color, #F3F3F3);
    }

    &:hover {
      background-color: var(--chotto-item-background-color-hover, #F6F6F6);
    }
  }


  &__selected {
    cursor: pointer;
    border-radius: var(--chotto-chat-item-border-radius);
    background: var(--chotto-item-background-color-focus);

    .chat-item__menu-button {
      background: var(--chotto-item-background-color-focus);
    }
  }

  &__with-scroll {
    padding-right: 11px;
  }

  &__avatar-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;
    object-fit: cover;
    margin-right: 15px;
    /* background-color: var(--chotto-avatar-background-color); */
    min-width: var(--chotto-avatar-medium);
    min-height: var(--chotto-avatar-medium);
    border-radius: var(--chotto-avatar-border-radius);

    span {
      font-size: var(--chotto-avatar-medium-icon-size);
      color: var(--chotto-avatar-color);
    }

    img {
      border-radius: var(--chotto-avatar-border-radius);
      object-fit: cover;
    }
  }

  &__avatar-placeholder {
    width: 48px;
    height: 48px;
  }

  &__status-user {
    position: absolute;
    bottom: 0;
    right: 5px;
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: transparent;
    z-index: 1;
  }

  &__info-container {
    flex-grow: 1;
    align-self: flex-start;
    margin-right: 15px;
    overflow: hidden;
  }

  &__name {
    margin-top: var(--chotto-chat-item-name-margin-top, 0);
    margin-bottom: var(--chotto-chat-item-name-margin-bottom, 8px);
    font-size: var(--chotto-title-font-size);
    font-weight: var(--chotto-title-font-weight);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  &__last-message {
    font-size: var(--chotto-text-font-size);
    color: var(--chotto-secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;

  }

  &__details-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: end;
    
    span {
      color: var(--chotto-button-color-active);
    }
  }

  &__status-unread-container {
    display: flex;
    align-items: center;
    gap: 4px;
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 0;
  }

  &__actions-trigger{
    display: block;
    cursor: pointer;
    font-size: var(--chotto-button-icon-size);
    color: var(--chotto-button-color-active);
  }

  &__actions-trigger:hover{
    color: var(--chotto-button-color-hover);
  }

  &__menu-button {
    order: 0;
    width: 100%;
    border: none;
    background-color: transparent;
    cursor: pointer;
    padding: 0;

    span {
      display: block;
      width: fit-content;
      margin-left: auto;
      font-size: 18px;
      transition: 0.2s;
    }

    &:hover span {
      color: var(--chotto-button-color-hover);
      transition: 0.2s;
    }
  }

  &__unread {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--chotto-unread-border-radius, 50%);
    min-width: var(--chotto-unread-min-width, 25px);
    min-height: var(--chotto-unread-min-height, 25px);
    max-height: 20px;
    font-size: var(--chotto-additional-text-font-size);
    font-weight: var(--chotto-unread-font-weight, 400);
    color: var(--chotto-unread-text-color);
    background-color: var(--chotto-unread-background-color);
    padding: 0 6px;
  }

  &__time {
    font-size: var(--chotto-additional-text-font-size);
    color: var(--chotto-secondary-text-color);
    white-space: nowrap;
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
  }

  &__context-menu {
    position: absolute;
    top: 40%;
    right: 0;
  }

  &__status-chat-container {
    display: flex;
    align-items: center;
    column-gap: 4px;
    margin-top: auto;
  }

  &__status-message {
    display: flex;

    span {
      color: var(--chotto-status-color-received);
      font-size: var(--chotto-text-font-size);
    }
  }

  &__dialog-buttons{
    display: flex;
    margin-left: 8px;
  }
}

.dialog{
  &__container {
    display: flex;
    flex-direction: column;
    position: relative;
    cursor: pointer;
    gap: 5px;
    padding: var(--chotto-chat-item-dialog-padding);
  }

  &__container--with-scroll {
    padding-right: 11px;
  }

  &__icon{
    margin: auto;
  }

  &__item{
    display: flex;
    padding: 3px;
  }

  &__selected {
    cursor: pointer;
    border-radius: var(--chotto-chat-item-border-radius);
    background: var(--chotto-item-background-color-focus);
  }

  &__text-container {
    display: flex;
    justify-content: space-between;
    font-size: var(--chotto-text-font-size);
    color: var(--chotto-primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    padding: 0 5px;
    margin: auto;
  }

  &__name{
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  &__time{
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    color: var(--chotto-secondary-text-color);
    font-size: var(--chotto-additional-text-font-size)
  }
}

.status--received span {
  color: var(--chotto-status-color-received);
}

.status--read span {
  color: var(--chotto-status-color-read);
}

.status--received span:first-child,
.status--read span:first-child {
  margin-right: -8px;
}

.status--pending span {
  color: var(--chotto-secondary-text-color);
}

.status--error span {
  color: var(--chotto-error-color, #ff4444);
}

.text-enter-active,
.text-leave-active {
  transition: opacity 0.2s ease;
}

.text-enter-from,
.text-leave-to {
  opacity: 0;
}

.menu-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.menu-enter-from,
.menu-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>