<template>
  <div
    ref="panelRef"
    class="communication-panel"
  >
    <!-- Панель с кнопками каналов -->
    <div
      ref="channelsPanelRef"
      class="channels-panel"
    >
      <button
        v-for="channel in channelsTypes"
        :key="channel.type"
        :class="['channel-btn', { 
          active: isChannelActive(channel.type),
          hover: hoveredChannel === channel.type && !isChannelActive(channel.type) || 
            hoveredChannel === channel.type && isChannelActive(channel.type)
        }]"
        @click="handleChannelClick(channel.type)"
        @mouseenter="hoveredChannel = channel.type"
        @mouseleave="hoveredChannel = null"
      >
        <template v-if="isChannelActive(channel.type)">
          <Tooltip
            :ref="(el) => { if (el) channelTooltipRef = el }"
            :text="showDefaultChannelTooltip ? 'Выбран канал по умолчанию, можно изменить в настройках профиля' : selectedChannel?.title"
            position="bottom-left"
            :offset="8"
            :trigger="showDefaultChannelTooltip ? 'auto' : 'hover'"
            :auto-show-duration="5000"
          >
            <span class="channel-icon">
              <component :is="channel.component" />
            </span>
          </Tooltip>
          <span class="active-indicator" />
        </template>
        <template v-else>
          <Tooltip
            :text="getTooltipText(channel.type)"
            position="bottom-left"
            :offset="8"
          >
            <span class="channel-icon">
              <component :is="channel.component" />
            </span>
          </Tooltip>
        </template>
      </button>
    </div>

    <!-- Меню контактов -->
    <div
      v-if="showMenu && activeChannelType"
      class="attributes-menu"
      :style="{ width: menuWidth }"
    >
      <!-- Заголовок для списка контактов -->
      <div 
        v-if="showRecentAttribute" 
        class="menu-header"
      >
        Недавний
      </div>

      <!-- Недавний контакт -->
      <Tooltip
        v-if="showRecentAttribute && props.recentAttributeChannels[activeChannelType]?.tooltip"
        :text="props.recentAttributeChannels[activeChannelType]?.tooltip"
        position="bottom"
        :offset="8"
      >
        <div
          :class="['recent-attribute', { 
            'frozen-hover': isRecentAttributeHovered 
          }]"
          @mouseenter="handleRecentAttributeMouseEnter($event)"
          @mouseleave="handleRecentAttributeMouseLeave"
          @mouseover="resetRegularAttributeHover"
          @click="handleRecentAttributeClick()"
        >
          <div class="attribute-info">
            <span class="attribute-value">{{ recentAttribute?.value }}</span>
          </div>
          <span
            class="channel-icon-small"
            :class="{ 'menu-icon-grey': activeChannelType !== 'sms' }"
          >
            <component :is="getMenuChannelIconComponent(activeChannelType)" />
          </span>
        </div>
      </Tooltip>
      <div
        v-else-if="showRecentAttribute"
        :class="['recent-attribute', { 
          'frozen-hover': isRecentAttributeHovered 
        }]"
        @mouseenter="handleRecentAttributeMouseEnter($event)"
        @mouseleave="handleRecentAttributeMouseLeave"
        @mouseover="resetRegularAttributeHover"
        @click="handleRecentAttributeClick()"
      >
        <div class="attribute-info">
          <span class="attribute-value">{{ recentAttribute?.value }}</span>
        </div>
        <span
          class="channel-icon-small"
          :class="{ 'menu-icon-grey': activeChannelType !== 'sms' }"
        >
          <component :is="getMenuChannelIconComponent(activeChannelType)" />
        </span>
      </div>

      <div 
        v-if="showRecentAttribute && organizedContactAttributes[activeChannelType]?.length && activeChannelType !== 'phone'" 
        class="menu-divider"
      />

      <!-- Все контакты -->
      <div
        v-for="attribute in organizedContactAttributes[activeChannelType]"
        :key="attribute.attributeId"
        :class="['attribute-item', { 
          'frozen-hover': isAttributeFrozen(attribute) 
        }]"
        @mouseenter="handleAttributeMouseEnter(attribute, $event)"
        @mouseleave="handleAttributeMouseLeave"
        @click="handleAttributeClick(attribute)"
      >
        <div class="attribute-info">
          <span class="attribute-value">{{ attribute.value }}</span>
        </div>
        <span class="menu-icon">
          <span
            v-if="hasMultipleChannels(activeChannelType)"
            class="menu-icon-arrow"
          />
          <span
            v-else
            class="channel-icon-small"
            :class="{ 'menu-icon-grey': activeChannelType !== 'sms' }"
          >
            <component :is="getSingleMenuChannelIconComponent(activeChannelType)" />
          </span>
        </span>
      </div>

      <!-- Второй уровень меню -->
      <div
        v-if="showSubMenu && shouldShowSubMenu"
        class="sub-menu left"
        :style="{ top: subMenuTop + 'px' }"
        @mouseenter="keepSubMenuOpen"
        @mouseleave="closeSubMenu"
      >
        <div class="sub-menu-header">
          Канал связи
        </div>
        
        <div
          v-for="channel in availableChannels"
          :key="channel.channelId"
          class="sub-menu-item"
          @click="selectChannel(channel.channelId)"
        >
          <span class="sub-menu-title">{{ channel.title || channel.channelId }}</span>
          <span
            class="sub-menu-icon"
            :class="{ 'menu-icon-grey': getChannelTypeFromId(channel.channelId) !== 'sms' }"
          >
            <component :is="getMenuChannelIconComponentForChannelId(channel.channelId)" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import Tooltip from './Tooltip.vue';

import { 
  CommunicationPanelPhoneIcon,
  CommunicationPanelWhatsAppIcon,
  CommunicationPanelTelegramIcon,
  CommunicationPanelMaxIcon,
  CommunicationPanelSMSIcon,
  CommunicationPanelSubmenuPhoneIcon,
  CommunicationPanelSubmenuWhatsAppIcon,
  CommunicationPanelSubmenuTelegramIcon,
  CommunicationPanelSubmenuMaxIcon,
  CommunicationPanelSubmenuSMSIcon
} from '@/library/icons/index.ts'

const props = defineProps({
  contactAttributes: {
    type: Array,
    required: true,
    default: () => [],
  },
  channels: {
    type: Array,
    required: true,
    default: () => [],
  },
  recentAttributeChannels: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  selectedDialog: {
    type: Object,
    required: false,
    default: null,
  },
  channelTooltips: {
    type: Object,
    required: false,
    default: () => ({})
  },
  messages: {
    type: Array,
    required: false,
    default: () => []
  },
  selectedChat: {
    type: Object,
    required: false,
    default: null
  },
});

const emit = defineEmits(['select-attribute-channel', 'phone-call']);

// Refs
const panelRef = ref(null);
const channelsPanelRef = ref(null);
const activeChannelType = ref(null);
const hoveredChannel = ref(null);
const showMenu = ref(false);
const showSubMenu = ref(false);
const hoveredAttribute = ref(null);
const menuWidth = ref('0px');
const frozenAttribute = ref(null);
const isRecentAttributeHovered = ref(false);
const selectedChannelType = ref(null);
const selectedChannel = ref({});
const subMenuTop = ref(0);
const showDefaultChannelTooltip = ref(false);
const defaultChannelTooltipTimer = ref(null);
const channelTooltipRef = ref(null);

// Constants
const CHANNEL_TYPES = ['phone', 'whatsapp', 'telegram', 'max', 'sms'];

const channelIconsMap = {
  phone: CommunicationPanelPhoneIcon,
  whatsapp: CommunicationPanelWhatsAppIcon,
  telegram: CommunicationPanelTelegramIcon,
  max: CommunicationPanelMaxIcon,
  sms: CommunicationPanelSMSIcon,
};

const menuChannelIconsMap = {
  phone: CommunicationPanelSubmenuPhoneIcon,
  whatsapp: CommunicationPanelSubmenuWhatsAppIcon,
  telegram: CommunicationPanelSubmenuTelegramIcon,
  max: CommunicationPanelSubmenuMaxIcon,
  sms: CommunicationPanelSubmenuSMSIcon,
};

const channelsTypes = computed(() => 
  CHANNEL_TYPES.map(type => ({
    type,
    component: channelIconsMap[type]
  }))
);

// Computed properties
const organizedContactAttributes = ref(
  Object.fromEntries(CHANNEL_TYPES.map(type => [type, []]))
);

const recentAttribute = computed(() => 
  activeChannelType.value ? getRecentAttributeByType(activeChannelType.value) : null
);

const showRecentAttribute = computed(() =>
  activeChannelType.value !== 'phone' &&
  recentAttribute.value &&
  props.recentAttributeChannels[activeChannelType.value]?.channelId
);

const availableChannels = computed(() =>
  activeChannelType.value ? getAvailableChannels(activeChannelType.value) : []
);

const shouldShowSubMenu = computed(() =>
  showSubMenu.value &&
  hoveredAttribute.value &&
  availableChannels.value.length > 0 &&
  activeChannelType.value !== 'phone' &&
  hasMultipleChannels(activeChannelType.value)
);

// Methods
const defaultTooltips = {
  phone: 'Позвонить',
  whatsapp: 'Выберите контакт и канал для отправки сообщения',
  telegram: 'Выберите контакт и канал для отправки сообщения',
  max: 'Выберите контакт и канал для отправки сообщения',
  sms: 'Выберите контакт и канал для отправки сообщения',
};

const getTooltipText = (channelType) => {
  return props.channelTooltips?.[channelType] ?? defaultTooltips[channelType] ?? '';
};

const getChannelTypeFromId = (channelId) => {
  if (!channelId) return null;
  
  const [type] = channelId.split('.');
  
  if (type.includes('waba')) return 'whatsapp';
  if (type.includes('telegrambot')) return 'telegram';
  
  return type;
};

const isChannelEmpty = (channelId) => {
  
  if (!channelId || !props.messages) return true;
  
  const chatId = props.selectedChat?.chatId;
  if (!chatId) return true;
  
  const channelMessages = props.messages.filter(msg => 
    msg.chatId === chatId && 
    msg.dialogId === props.selectedDialog?.dialogId
  );
  
  const hasNonSystemMessages = channelMessages.some(msg => 
    msg.type !== 'message.system' && 
    msg.type !== 'message.delimiter' && 
    msg.type !== 'system' && 
    msg.type !== 'system_message' && 
    msg.type !== 'notification'
  );
  
  const isEmpty = !hasNonSystemMessages;
  
  return isEmpty;
};

const hasMultipleChannels = (channelType) => {
  return props.channels.filter(channel => 
    getChannelTypeFromId(channel.channelId) === channelType
  ).length > 1;
};

const isChannelActive = (channelType) => {
  return selectedChannelType.value === channelType;
};

const getSingleChannelForType = (channelType) => {
  const channelsForType = props.channels.filter(channel => 
    getChannelTypeFromId(channel.channelId) === channelType
  );
  return channelsForType.length === 1 ? channelsForType[0] : null;
};

const getMenuChannelIconComponent = (channelType) => {
  return menuChannelIconsMap[channelType] || null;
};

const getMenuChannelIconComponentForChannelId = (channelId) => {
  const channelType = getChannelTypeFromId(channelId);
  return getMenuChannelIconComponent(channelType);
};

const getSingleMenuChannelIconComponent = (channelType) => {
  const singleChannel = getSingleChannelForType(channelType);
  return singleChannel ? getMenuChannelIconComponentForChannelId(singleChannel.channelId) : getMenuChannelIconComponent(channelType);
};

const organizeContactAttributes = () => {
  const organized = Object.fromEntries(CHANNEL_TYPES.map(type => [type, []]));
  
  props.contactAttributes.forEach(attr => {
    if (attr.type === 'telegram') {
      organized.telegram.push(attr);
    } else if (attr.type === 'phone') {
      ['whatsapp', 'max', 'sms', 'phone'].forEach(type => {
        organized[type].push(attr);
      });
    }
  });
  
  organizedContactAttributes.value = organized;
};

const getAvailableChannels = (channelType) => {
  return props.channels.filter(channel => 
    getChannelTypeFromId(channel.channelId) === channelType
  );
};

const getRecentAttributeByType = (channelType) => {
  const recentAttributeId = props.recentAttributeChannels[channelType]?.attributeId;
  return props.contactAttributes.find(attr => attr.id === recentAttributeId);
};

const isAttributeFrozen = (attribute) => {
  return frozenAttribute.value?.id === attribute.id;
};

// Обработчик клика по каналу
const handleChannelClick = (channelType) => {
  // Если канал уже выбран, просто открываем/закрываем меню
  if (selectedChannelType.value === channelType) {
    if (activeChannelType.value === channelType) {
      closeMenu();
    } else {
      activeChannelType.value = channelType;
      showMenu.value = true;
      showSubMenu.value = false;
      frozenAttribute.value = null;
      isRecentAttributeHovered.value = false;
      updateMenuWidth();
    }
  } else {
    // Если кликаем на другой канал, просто открываем меню без установки активного состояния
    activeChannelType.value = channelType;
    showMenu.value = true;
    showSubMenu.value = false;
    frozenAttribute.value = null;
    isRecentAttributeHovered.value = false;
    updateMenuWidth();
  }
};

const closeMenu = () => {
  showMenu.value = false;
  activeChannelType.value = null;
  frozenAttribute.value = null;
  isRecentAttributeHovered.value = false;
  showSubMenu.value = false;
};

const handleRecentAttributeClick = () => {
  if (activeChannelType.value === 'phone') {
    handlePhoneCall(recentAttribute.value);
  } else if (!hasMultipleChannels(activeChannelType.value)) {
    const singleChannel = getSingleChannelForType(activeChannelType.value);
    if (recentAttribute.value && singleChannel) {
      selectSingleChannel(recentAttribute.value, singleChannel.channelId);
    }
  } else {
    const recentChannelId = props.recentAttributeChannels[activeChannelType.value]?.channelId;
    if (recentAttribute.value && recentChannelId) {
      selectChannelForRecentAttribute(recentChannelId);
    }
  }
};

const handleAttributeClick = (attribute) => {
  if (activeChannelType.value === 'phone') {
    handlePhoneCall(attribute);
  } else if (!hasMultipleChannels(activeChannelType.value)) {
    const singleChannel = getSingleChannelForType(activeChannelType.value);
    if (singleChannel) {
      selectSingleChannel(attribute, singleChannel.channelId);
    }
  }
};

const handlePhoneCall = (attribute) => {
  if (!attribute) return;
  emit('phone-call', {
    attributeId: attribute.id,
    phoneNumber: attribute.data
  });
  closeMenu();
};

const selectSingleChannel = (attribute, channelId) => {
  emit('select-attribute-channel', {
    attributeId: attribute.id,
    channelId: channelId,
  });
  selectedChannelType.value = activeChannelType.value;
  selectedChannel.value = props.channels.find(ch => ch.channelId === channelId);
  console.log('TEST selectedChannel.value', selectedChannel.value)
  
  if (isChannelEmpty(channelId)) {
    showDefaultChannelTooltipWithTimer();
  } else {
    clearDefaultChannelTooltip();
  }
  
  closeMenu();
};

const selectChannelForRecentAttribute = (channelId) => {
  if (recentAttribute.value) {
    emit('select-attribute-channel', {
      attributeId: recentAttribute.value.id,
      channelId: channelId,
    });
  }
  selectedChannelType.value = activeChannelType.value;
  selectedChannel.value = props.channels.find(ch => ch.channelId === channelId);
  console.log('TEST selectedChannel.value', selectedChannel.value)
  
  if (isChannelEmpty(channelId)) {
    showDefaultChannelTooltipWithTimer();
  } else {
    clearDefaultChannelTooltip();
  }
  
  closeMenu();
};

const handleRecentAttributeMouseEnter = (event) => {
  if (hasMultipleChannels(activeChannelType.value)) {
    resetRegularAttributeHover();
    isRecentAttributeHovered.value = true;
    showSubMenu.value = true;
    alignSubMenuWithTarget(event.currentTarget);
  }
};

const handleRecentAttributeMouseLeave = () => {
  if (!showSubMenu.value) {
    isRecentAttributeHovered.value = false;
  }
};

const handleAttributeMouseEnter = (attribute, event) => {
  if (hasMultipleChannels(activeChannelType.value)) {
    isRecentAttributeHovered.value = false;
    hoveredAttribute.value = attribute;
    showSubMenu.value = true;
    frozenAttribute.value = attribute;
    alignSubMenuWithTarget(event.currentTarget);
  }
};

const handleAttributeMouseLeave = () => {
  if (!showSubMenu.value) {
    frozenAttribute.value = null;
  }
};

const resetRegularAttributeHover = () => {
  showSubMenu.value = false;
  frozenAttribute.value = null;
  hoveredAttribute.value = null;
};

const keepSubMenuOpen = () => {
  showSubMenu.value = true;
};

const closeSubMenu = () => {
  showSubMenu.value = false;
  frozenAttribute.value = null;
  isRecentAttributeHovered.value = false;
};

const selectChannel = (channelId) => {
  if (isRecentAttributeHovered.value) {
    selectChannelForRecentAttribute(channelId);
  } else if (hoveredAttribute.value) {
    emit('select-attribute-channel', {
      attributeId: hoveredAttribute.value.id,
      channelId: channelId,
    });
    selectedChannelType.value = activeChannelType.value;
    selectedChannel.value = props.channels.find(ch => ch.channelId === channelId);
    console.log('TEST selectedChannel.value', selectedChannel.value)
    
    if (isChannelEmpty(channelId)) {
      showDefaultChannelTooltipWithTimer();
    } else {
      clearDefaultChannelTooltip();
    }
  }
  closeMenu();
};

const updateMenuWidth = () => {
  if (channelsPanelRef.value) {
    menuWidth.value = `${channelsPanelRef.value.offsetWidth}px`;
  }
};

const alignSubMenuWithTarget = (targetEl) => {
  try {
    requestAnimationFrame(() => {
      const menuEl = panelRef.value?.querySelector('.attributes-menu');
      const headerEl = panelRef.value?.querySelector('.sub-menu-header');
      const subMenuEl = panelRef.value?.querySelector('.sub-menu');
      if (!menuEl || !targetEl) {
        subMenuTop.value = 0;
        return;
      }
      const menuRect = menuEl.getBoundingClientRect();
      const itemRect = targetEl.getBoundingClientRect();
      let headerBlock = 0;
      if (headerEl) {
        const headerRect = headerEl.getBoundingClientRect();
        const cs = getComputedStyle(headerEl);
        const mb = parseFloat(cs.marginBottom || '0');
        headerBlock = headerRect.height + (isNaN(mb) ? 0 : mb);
      }
      let subMenuPadTop = 0;
      if (subMenuEl) {
        const smcs = getComputedStyle(subMenuEl);
        subMenuPadTop = parseFloat(smcs.paddingTop || '0') || 0;
      }
      subMenuTop.value = itemRect.top - menuRect.top - headerBlock - subMenuPadTop - 2;
    });
  } catch {
    subMenuTop.value = 0;
  }
};

const handleClickOutside = (event) => {
  if (panelRef.value && !panelRef.value.contains(event.target)) {
    closeMenu();
  }
};

// Watchers
watch(() => props.contactAttributes, organizeContactAttributes, { deep: true });
watch(() => props.selectedDialog, (newDialog) => {
  updateSelectedChannelFromDialog(newDialog);
}, { deep: true });
const updateSelectedChannelFromDialog = (dialog) => {
  if (!dialog) {
    selectedChannelType.value = null;
    selectedChannel.value = {};
    clearDefaultChannelTooltip();
    return;
  }
  
  const channelType = getChannelTypeFromId(dialog.channelId);
  if (channelType && CHANNEL_TYPES.includes(channelType)) {
    selectedChannelType.value = channelType;
    selectedChannel.value = props.channels.find(ch => ch.channelId === dialog.channelId);
    
    if (isChannelEmpty(dialog.channelId)) {
      showDefaultChannelTooltipWithTimer();
    } else {
      clearDefaultChannelTooltip();
    }
  }
};

const showDefaultChannelTooltipWithTimer = () => {
  clearDefaultChannelTooltip();
  showDefaultChannelTooltip.value = true;
  
  nextTick(() => {
    
    const tooltipRef = Array.isArray(channelTooltipRef.value) ? channelTooltipRef.value[0] : channelTooltipRef.value;
    
    if (tooltipRef && typeof tooltipRef.startAutoShow === 'function') {
      tooltipRef.startAutoShow();
    } else {
      console.log('startAutoShow method not found on tooltipRef');
    }
  });
  
  defaultChannelTooltipTimer.value = setTimeout(() => {
    showDefaultChannelTooltip.value = false;
  }, 5000);
};

const clearDefaultChannelTooltip = () => {
  if (defaultChannelTooltipTimer.value) {
    clearTimeout(defaultChannelTooltipTimer.value);
    defaultChannelTooltipTimer.value = null;
  }
  
  if (channelTooltipRef.value) {
    const tooltipRef = Array.isArray(channelTooltipRef.value) ? channelTooltipRef.value[0] : channelTooltipRef.value;
    if (tooltipRef && typeof tooltipRef.clearAutoTimer === 'function') {
      tooltipRef.clearAutoTimer();
    }
  }
  
  showDefaultChannelTooltip.value = false;
};

// Lifecycle
onMounted(() => {
  updateMenuWidth();
  window.addEventListener('resize', updateMenuWidth);
  document.addEventListener('click', handleClickOutside);
  organizeContactAttributes();
  updateSelectedChannelFromDialog(props.selectedDialog);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMenuWidth);
  document.removeEventListener('click', handleClickOutside);
  clearDefaultChannelTooltip();
});
</script>

<style scoped>
.communication-panel {
  position: relative;
  display: inline-block;
}

.channels-panel {
  display: flex;
  background: white;
  border: 0.01rem solid;
  border-radius: 5px;
  border-color: #EEEEEE;
  padding: 0px;
  gap: 0;
  position: relative;
  height: 40px;
}

.channel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  width: var(--chotto-communication-panel-btn-width, 50px);
}

.channel-btn:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 25%;
  bottom: 25%;
  width: 1px;
  background-color: var(--chotto-communication-panel-btn-divider-color, #F6F6F6);
}

.channel-btn:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.channel-btn:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.channel-btn.hover {
  background: var(--chotto-item-background-color-hover, #F6F6F6);
}

.channel-btn.active {
  color: var(--chotto-communication-panel-btn-active-color, #007CFF);
}

.active-indicator {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 48%;
  height: 2px;
  background: var(--chotto-communication-panel-btn-active-color, #007CFF);
  border-radius: 20px;
}

.channel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.attributes-menu {
  position: absolute;
  top: 108%;
  left: 0;
  background: white;
  border: 1px solid #e9e7e7;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  z-index: 1000;
  max-height: 300px;
  gap: 2px;
}

.menu-header {
  padding: 8px 16px 4px;
  font-size: var(--chotto-text-font-size);
  color: var(--chotto-secondary-text-color);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.recent-attribute,
.attribute-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.recent-attribute:hover,
.attribute-item:hover {
  background: var(--chotto-item-background-color-hover);
}

.attribute-info {
  display: flex;
  flex-direction: column;
}

.attribute-value {
  font-weight: 500;
  font-size: var(--chotto-text-font-size);
  color: var(--chotto-primary-text-color);
}

.channel-icon-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 8px;
}

.menu-icon-grey {
  color: #5F5F5F;
}

.menu-icon {
  color: #999;
  font-weight: bold;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon-arrow {
  width: 9px;
  height: 9px;
  border-top: 1px solid #5F5F5F;
  border-right: 1px solid #5F5F5F;
  transform: rotate(45deg);
}

.menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 12px;
}

.attribute-item.frozen-hover,
.recent-attribute.frozen-hover {
  background: var(--chotto-item-background-color-hover);
}

.sub-menu {
  position: absolute;
  top: 0;
  right: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  min-width: 250px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.sub-menu-header {
  padding: 8px 12px 2px;
  font-size: var(--chotto-text-font-size);
  color: var(--chotto-secondary-text-color);
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.sub-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 4px;
  gap: 12px;
}

.sub-menu-item:hover {
  background: var(--chotto-item-background-color-hover);
}

.sub-menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-left: auto;
}

.sub-menu-title {
  font-size: var(--chotto-text-font-size);
  color: var(--chotto-primary-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.attributes-menu :deep(.tooltip-wrapper) {
  display: block;
  width: 100%;
}
</style>