<template>
  <Tooltip
    v-if="isVisible"
    :text="statusTitle"
    :position="tooltipPosition"
  >
    <div :class="statusContainerClasses">
      <template v-if="messageStatus === 'pending'">
        <span class="pi pi-clock" />
      </template>
      <template v-else-if="messageStatus === 'error'">
        <span class="pi pi-exclamation-circle" />
      </template>
      <template v-else>
        <span
          v-if="messageStatus !== 'sent'"
          class="pi pi-check"
        />
        <span class="pi pi-check" />
      </template>
    </div>
  </Tooltip>
</template>

<script
  setup
  lang="ts"
>
import { computed } from 'vue';

import Tooltip from '../components/Tooltip.vue';
import { statuses as defaultStatuses } from '../../helpers';

defineOptions({
  name: 'MessageStatusIndicator',
});

const props = defineProps({
  baseClass: {
    type: String,
    required: true,
  },
  messageStatus: {
    type: String,
    required: true,
  },
  statusClass: {
    type: String,
    default: '',
  },
  statusTitle: {
    type: String,
    default: '',
  },
  messageClass: {
    type: String,
    required: true,
  },
  tooltipPosition: {
    type: String,
    default: 'bottom-left',
  },
  statuses: {
    type: Array as () => string[],
    default: () => defaultStatuses,
  },
});

const isVisible = computed(() => {
  return props.messageClass === `${props.baseClass}__right` && props.statuses.includes(props.messageStatus);
});

const statusContainerClasses = computed(() => {
  const classes = [`${props.baseClass}__status`];
  if (props.statusClass) {
    classes.push(props.statusClass);
  }
  return classes;
});
</script>

<style lang="scss">
// Глобальные стили для статусов сообщений
// Применяются ко всем компонентам сообщений через классы
.text-message__status,
.image-message__status,
.audio-message__status,
.file-message__status,
.video-message__status {
  display: flex;
  cursor: pointer;

  span {
    color: var(--chotto-status-color-received);
    font-size: var(--chotto-small-text-icon-size);
  }
}

// Стили для статуса received
.status--received {
  span {
    color: var(--chotto-status-color-received);

    &:first-child {
      margin-right: -8px;
    }
  }
}

// Стили для статуса read
.status--read {
  span {
    color: var(--chotto-status-color-read);

    &:first-child {
      margin-right: -8px;
    }
  }
}

// Стили для pending статуса
.status--pending {
  span {
    color: var(--chotto-secondary-text-color);
  }
}

// Стили для error статуса
.status--error {
  span {
    color: var(--chotto-error-color, #ff4444);
  }
}
</style>

