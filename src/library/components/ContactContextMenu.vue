<template>
  <div class="contact-context-menu__wrapper">
    <button
      :id="'container-' + contextMenuId + extChatAppId"
      ref="actionScope"
      class="contact-context-menu__button"
      @mouseenter="hover"
      @mouseleave="hoverOut"
      @click="toggle"
    >
      <span class="contact-context-menu__icon">
        <MenuIcon />
      </span>
      <Teleport to="body">
        <ContextMenu
          :id="'context-menu-' + contextMenuId + extChatAppId"
          :actions="actions"
          :data-theme="getTheme().theme ? getTheme().theme : 'light'"
          @mouseenter="hoverCM"
          @mouseleave="hoverOutCM"
          @click="click"
        />
      </Teleport>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useId, inject, nextTick} from 'vue';
import { ContextMenu } from '.';
import { useTheme } from '../../helpers/useTheme';
import MenuIcon from '../icons/MenuIcon.vue';

const chatAppId = inject('chatAppId')
const extChatAppId = inject('extChatAppId')

const { getTheme } = useTheme(chatAppId as string)

const props = defineProps({
  actions: {
    type: Array,
    required: true,
  },
  mode: {
    type: String,
    required: false,
    default: 'hover',
  },
  disabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  menuSide: {
    type: String,
    required: false,
    default: 'top'
  },
});

const contextMenuId = useId()

const emit = defineEmits(['click', 'buttonClick', 'menuMouseEnter', 'menuMouseLeave']);

const contextMenu = ref()
const actionScope = ref()
const isOpened = ref(false)

const click = (action) => {
  hideMenu()
  emit('click', action);
}

const toggle = () => {
  if (!props.disabled) {
    if (props.mode == 'click' && !isOpened.value) {
      updatePosition()
    }
    else if (props.mode == 'click' && isOpened.value) {
      hideMenu()
    }
    emit('buttonClick')
  }
}

const hover = () => {
  if (!props.disabled) {
    if (props.mode == 'hover') {
      updatePosition()
    }
  }
}

const hoverOut = () => {
  if (!props.disabled) {
    if (props.mode == 'hover') {
      hideMenu()
    }
  }
}

const hoverCM = () => {
  emit('menuMouseEnter')
  if (!props.disabled) {
    if (props.mode == 'hover') {
      updatePosition()
    }
  }
}

const hoverOutCM = () => {
  emit('menuMouseLeave')
  if (!props.disabled) {
    if (props.mode == 'hover') {
      hideMenu()
    }
  }
}

const updatePosition = () => {
  if (actionScope.value && contextMenu.value){
    const t = contextMenu.value
    const bounds = actionScope.value.getBoundingClientRect()
    t.style.display = 'inherit'
    const cmBounds = contextMenu.value.getBoundingClientRect()
    t.style.display = 'none'
    nextTick(() => {
      const r = {
        'left'  : {top: bounds.top - ((cmBounds.height - bounds.height) / 2) - cmBounds.top, left: bounds.left - cmBounds.width - cmBounds.left},
        'right' : {top: bounds.top - ((cmBounds.height - bounds.height) / 2) - cmBounds.top, left: bounds.left + bounds.width - cmBounds.left},
        'bottom': {top: bounds?.bottom - cmBounds.top, left: bounds?.left - ((cmBounds.width - bounds.width) / 2) - cmBounds.left},
        'top'   : {top: bounds.top - cmBounds.height - cmBounds.top, left: bounds?.left - ((cmBounds.width - bounds.width) / 2) - cmBounds.left},
        'top-right': { top: bounds.top - cmBounds.height, left: bounds.right - (cmBounds.width / 2) },
        'bottom-left': {top: bounds?.bottom - cmBounds.top + 10, left: bounds.left - cmBounds.width - cmBounds.left + 50},
      }
      //console.log(bounds, cmBounds, 'top: ', r[props.menuSide].top + 'px', ' left: ', r[props.menuSide].left + 'px')
      t.style.top = r[props.menuSide].top + 'px'
      t.style.left = r[props.menuSide].left + 'px'
      t.style.opacity = '1'
      t.style.display = 'inherit'
      isOpened.value = true
    })
  }
}

const hideMenu = () => {
  if (contextMenu.value){
    const t = contextMenu.value
    if (t){
      t.style.top = '0'
      t.style.left = '0'
      t.style.opacity = '0'
      t.style.display = 'none'
      isOpened.value = false
    }
  }
}

const handleClickOutside = (event) => {
  if (props.mode == 'click' && actionScope.value && !actionScope.value.contains(event.target)) {
    hideMenu()
  }
}

onMounted(() => {
  nextTick(() => {
    contextMenu.value = document.getElementById('context-menu-' + contextMenuId + extChatAppId)
    if (contextMenu.value) {
      hideMenu()
      document.addEventListener("click", handleClickOutside)
    }
  })
})

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside)
})

defineExpose({
  updatePosition,
  hideMenu,
})

</script>

<style
  scoped
  lang="scss"
>
.contact-context-menu__wrapper {
  display: var(--chotto-contact-context-menu-wrapper-display, flex);
  align-items: var(--chotto-contact-context-menu-wrapper-align-items, center);
  justify-content: var(--chotto-contact-context-menu-wrapper-justify-content, center);
  margin-right: var(--chotto-contact-context-menu-wrapper-margin-right, 15px);
  margin-left: var(--chotto-contact-context-menu-wrapper-margin-left, 10px);

  .contact-context-menu__button {
    background: var(--chotto-contact-context-menu-button-bg, none);
    border: var(--chotto-contact-context-menu-button-border, none);
    padding: var(--chotto-contact-context-menu-button-padding, 0);
    font: var(--chotto-contact-context-menu-button-font, inherit);
    color: var(--chotto-contact-context-menu-button-color, inherit);
    cursor: var(--chotto-contact-context-menu-button-cursor, pointer);
    outline: var(--chotto-contact-context-menu-button-outline, none);
    transition: var(--chotto-contact-context-menu-button-transition, all 0.2s);
    border-radius: var(--chotto-contact-context-menu-button-border-radius, 50%);
    width: var(--chotto-contact-context-menu-button-width, 40px);
    height: var(--chotto-contact-context-menu-button-height, 40px);
    display: var(--chotto-contact-context-menu-button-display, flex);
    align-items: var(--chotto-contact-context-menu-button-align-items, center);
    justify-content: var(--chotto-contact-context-menu-button-justify-content, center);
    position: var(--chotto-contact-context-menu-button-position, relative);
    
    &:hover {
      background-color: var(--chotto-contact-context-menu-button-hover-bg, var(--neutral-90, #F6F6F6));
    }
    
    &:active {
      transform: var(--chotto-contact-context-menu-button-active-transform, scale(0.95));
    }

    .contact-context-menu__icon {
      display: var(--chotto-contact-context-menu-icon-display, flex);
      align-items: var(--chotto-contact-context-menu-icon-align-items, center);
      justify-content: var(--chotto-contact-context-menu-icon-justify-content, center);
    }
  }
}

.context-menu__container {
  display: var(--chotto-contact-context-menu-container-display, flex);
  align-items: var(--chotto-contact-context-menu-container-align-items, center);
  justify-content: var(--chotto-contact-context-menu-container-justify-content, center);
  border: var(--chotto-contact-context-menu-container-border, 1px solid var(--neutral-75, #F3F3F3));
  border-radius: var(--chotto-contact-context-menu-container-border-radius, 4px);
  box-shadow: var(--chotto-contact-context-menu-container-box-shadow, 0px 5px 5px 1px var(--neutral-400, #a3a3a3));
}
</style>
