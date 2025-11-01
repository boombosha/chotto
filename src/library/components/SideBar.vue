<template>
  <div 
    ref="containerRef"
    class="sidebar__container"
    :class="{'sidebar-horizontal__container' : horizontal}"
  >
    <span
      v-if="!horizontal && barVisible"
      class="sidebar__selected-bar"
      :class="{ 'is-animating': isAnimating }"
      :style="{ top: barTop + 'px', height: barHeight + 'px' }"
    />
    <div class="sidebar__scroll-container">
      <ul 
        class="sidebar__list-fixed"
        :class="{'sidebar-horizontal__list-fixed' : horizontal}"
      >
        <li
          v-for="(item, index) in fixedItems"
          :key="index"
          class="sidebar__item-fixed"
          :class="{'sidebar-horizontal__item' : horizontal}"
          @click="onItemClick($event, item.itemId)"
        >
          <Tooltip 
            v-if="item.name" 
            :text="getName(item.name)" 
            position="right" 
            :offset="8"
          >
            <img
              :src="item.icon"
              :alt="item.name"
              class="sidebar__image"
              :class="{ 
                'sidebar__image--active': item.selected === true,
                'sidebar-horizontal__image' : horizontal 
              }"
            >
            <p>Мои</p>
            <span
              v-if="item.notificationCount"
            >{{ item.notificationCount > 99 ? '99+' : item.notificationCount }}</span>
          </Tooltip>
        </li>
      </ul>

      <ul 
        class="sidebar__list"
        :class="{'sidebar-horizontal__list' : horizontal}"
      >
        <li
          v-for="(item, index) in regularItems"
          :key="index"
          class="sidebar__item"
          :class="{'sidebar-horizontal__item' : horizontal}"
          @click="onItemClick($event, item.itemId)"
        >
          <Tooltip 
            v-if="item.name" 
            :text="item.name" 
            position="right" 
            :offset="8"
          >
            <img
              :src="item.icon"
              :alt="item.name"
              class="sidebar__image"
              :class="{ 
                'sidebar__image--active': item.selected === true,
                'sidebar-horizontal__image' : horizontal 
              }"
            >
          </Tooltip>
  
          <img
            v-else
            :src="item.icon"
            :alt="'icon'"
            class="sidebar__image"
            :class="{ 
              'sidebar__image--active': item.selected === true,
              'sidebar-horizontal__image' : horizontal 
            }"
          >
          <span
            v-if="item.notificationCount"
          >{{ item.notificationCount > 99 ? '99+' : item.notificationCount }}</span>
        </li>
      </ul>
    </div>

    <div
      v-if="showSettings"
      class="sidebar__settings-container"
    >
      <ButtonContextMenu
        :actions="menuActions"
        mode="click"
        menu-side="top-right"
        @click="handleMenuAction"
        @button-click="handleButtonClick"
      >
        <button class="sidebar__settings-btn">
          <SettingsIcon />
        </button>
      </ButtonContextMenu>
    </div>
  </div>
</template>

<script setup>
import { toRef, computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import ButtonContextMenu from './ButtonContextMenu.vue';
import SettingsIcon from '../../library/icons/SettingsIcon.vue';
import Tooltip from './Tooltip.vue';

const props = defineProps({
  sidebarItems: {
    type: Array,
    required: true,
    default: () => [],
  },
  horizontal: {
    type: Boolean,
    required: false,
    default: false,
  },
  menuActions: {
    type: Array,
    required: false,
    default: () => []
  },
  showSettings: {
    type: Boolean,
    required: false,
    default: true,
  }
});

const items = toRef(props, 'sidebarItems');
const menuActions = toRef(props, 'menuActions');

const emit = defineEmits(["selectItem"]);

const fixedItems = computed(() => 
  items.value
    .filter(i => i.isFixedBottom)
    .sort((a, b) => b.notificationCount - a.notificationCount)
);

const regularItems = computed(() => 
  items.value
    .filter(i => !i.isFixedBottom)
    .sort((a, b) => b.notificationCount - a.notificationCount)
);

const selectItem = (itemId) => {
  const item = items.value.find(i => i.itemId === itemId);
  emit('selectItem', item);
};

const onItemClick = (event, itemId) => {
  animateBarToTarget(event.currentTarget);
  selectItem(itemId);
};

const getName = (name) => {
  const parts = name.split(' ');
  return parts.length > 2 ? parts.slice(0, 2).join(' ') : name;
};

const handleMenuAction = (action) => {
  console.log('Выбрано действие:', action);
  if (typeof action.action === 'function') {
    action.action();
  }
};

const handleButtonClick = () => {
  console.log('Кнопка меню была нажата');
};

const containerRef = ref(null);
const barVisible = ref(false);
const barTop = ref(0);
const barHeight = ref(40);
const isAnimating = ref(false);

const computeTopForAvatar = (avatarEl) => {
  const containerEl = containerRef.value;
  if (!containerEl || !avatarEl) return 0;
  const containerRect = containerEl.getBoundingClientRect();
  const avatarRect = avatarEl.getBoundingClientRect();
  const centerY = avatarRect.top + (avatarRect.height / 2);
  const top = centerY - containerRect.top - barHeight.value / 2;
  return Math.max(0, top);
};

const syncBarWithSelected = () => {
  if (!containerRef.value) return;
  const containerEl = containerRef.value;
  const active = containerEl.querySelector('.sidebar__image--active');
  if (active) {
    barTop.value = computeTopForAvatar(active);
    barVisible.value = true;
  } else {
    barVisible.value = false;
  }
};

const animateBarToTarget = (liEl) => {
  try {
    if (!liEl || !containerRef.value) return;
    const avatarEl = liEl.querySelector('.sidebar__image');
    if (!avatarEl) return;
    const targetTop = computeTopForAvatar(avatarEl);

    const MIN_HEIGHT = 12;
    const STEP_MS = 160;

    isAnimating.value = true;
    barHeight.value = MIN_HEIGHT;
    setTimeout(() => {
      barTop.value = targetTop;
      requestAnimationFrame(() => {
        barHeight.value = 40;
        setTimeout(() => {
          isAnimating.value = false;
        }, STEP_MS);
      });
    }, STEP_MS);
  } catch {
    // ignore
  }
};

const handleResize = () => syncBarWithSelected();

onMounted(() => {
  nextTick(syncBarWithSelected);
  window.addEventListener('resize', handleResize);
  const scrollEl = containerRef.value?.querySelector('.sidebar__scroll-container');
  if (scrollEl) scrollEl.addEventListener('scroll', syncBarWithSelected);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  const scrollEl = containerRef.value?.querySelector('.sidebar__scroll-container');
  if (scrollEl) scrollEl.removeEventListener('scroll', syncBarWithSelected);
});

watch(() => items.value.map(i => i.selected), () => nextTick(syncBarWithSelected));
</script>

<style scoped lang="scss">
.sidebar {
  &__container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--chotto-sidebar-padding-container);
    background-color: transparent;
    position: relative;
    overflow: hidden;
  }

  &__scroll-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 60px;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__list-fixed {
    position: sticky;
    top: 0;
    z-index: 3;
    background-color: var(--chotto-layout-extended-first-col-bg);
    padding: var(--chotto-sidebar-list-fixed-padding, 12px 10px 22px);
    margin-bottom: 15px;
    border-top: var(--chotto-sidebar-list-fixed-border-top, none);
    display: flex;
    flex-direction: column;
    row-gap: var(--chotto-sidebar-row-gap-list);

    &::after {
      content: '';
      position: absolute;
      bottom: 7px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: var(--chotto-sidebar-list-fixed-border-bottom-width, 1px);
      background-color: var(--chotto-sidebar-list-fixed-border-bottom-color, #ccc);
      display: var(--chotto-sidebar-list-fixed-border-bottom-display, block);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    row-gap: var(--chotto-sidebar-row-gap-list);
    padding: 0;
    background-color: var(--chotto-layout-extended-first-col-bg);
    z-index: 2;
  }

  &__item {
    max-height: var(--chotto-avatar-small);
  }

  &__item,
  &__item-fixed {
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    row-gap: 2px;
    align-items: center;
    background-color: transparent;
    border-radius: 0;

    &::before {
      content: '';
      position: absolute;
      width: var(--chotto-sidebar-item-hover-width, 64px);
      height: var(--chotto-sidebar-item-hover-height, 50px);
      border-radius: var(--chotto-sidebar-item-hover-radius, 2px);
      background-color: transparent;
      top: calc((var(--chotto-avatar-small) - 50px) / 2);
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;
      transition: background-color 0.2s ease;
      pointer-events: none;
    }

    &:hover::before {
      background-color: var(--chotto-sidebar-item-hover-background-color, #FFFFFF);
    }

    span {
      position: absolute;
      top: 2px;
      right: 7px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
      max-width: 29px;
      min-width: 16px;
      height: var(--chotto-sidebar-notification-count-height, 18px);
      border-radius: 10px;
      line-height: 16px;
      font-size: var(--chotto-small-text-font-size);
      font-weight: var(--chotto-small-text-font-weight, 400);
      color: var(--chotto-unread-text-color);
      background-color: var(--chotto-unread-background-color);
      z-index: 2;
    }

    p {
      font-size: var(--chotto-small-text-font-size);
      text-align: center;
      line-height: 1;
      color: var(--chotto-header-font-color, #5F5F5F);
    }
  }

  &__item-fixed span {
    right: -8px;
  }

  &__image {
    position: relative;
    z-index: 1;
    border-radius: 50%;
    object-fit: cover;
    transition: all 0.2s;
    opacity: 0.8;
    width: var(--chotto-avatar-small);
    height: var(--chotto-avatar-small);
  }

  &__image--active {
    opacity: 1;
  }

  &__settings-container {
    background-color: var(--chotto-layout-extended-first-col-bg);
    position: absolute;
    bottom: 7px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    z-index: 2;
  }

  &__settings-btn {
    background: none;
    border: none;
    padding: 12px;
    margin: 0;
    outline: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: var(--neutral-125);
    }
  }
}

.sidebar__selected-bar {
  position: absolute;
  width: 2px;
  height: 40px;
  left: 3px;
  top: 0;
  border-radius: 2px;
  background-color: #007CFF;
  z-index: 4;
  transition: top 0.16s ease, height 0.16s ease;
}

.sidebar-horizontal {
  &__container {
    flex-direction: row;
    height: fit-content;
    padding-top: 0;
    padding-bottom: 5px;
    background-color: transparent;
  }

  &__list,
  &__list-fixed {
    flex-direction: row;
  }

  &__list {
    gap: var(--chotto-sidebar-row-gap-list);
  }

  &__list-fixed {
    position: static;
    padding-left: 10px;
    border-left: var(--chotto-sidebar-list-fixed-border-top);
    padding-top: 0;
    border-top: 0;
    margin-right: 10px;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  &__item,
  &__item-fixed {
    display: block;
    max-width: 70px;
    text-align: center;

    span {
      width: 24px;
      height: 24px;
      left: 45px;
    }

    p {
      font-size: 14px;
    }
  }

  &__image {
    width: calc(var(--chotto-avatar-small) * 1.2);
    height: calc(var(--chotto-avatar-small) * 1.2);
  }
}
</style>