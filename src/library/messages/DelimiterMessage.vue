<template>
  <div class="delimiter-message__container">
    <p class="delimiter-message__text">
      {{ message.text }}
    </p>
  </div>
</template>

<script setup lang="ts">

import { IDelimiterMessage } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  message: {
    type: Object as () => IDelimiterMessage,
    required: true,
  },
});

</script>

<style
  scoped
  lang="scss"
>
.delimiter-message {
  &__container {
    display: var(--chotto-delimiter-message-display, flex);
    align-items: var(--chotto-delimiter-message-align-items, center);
    justify-content: var(--chotto-delimiter-message-justify-content, center);
    width: var(--chotto-delimiter-message-width, 90%);
    height: var(--chotto-delimiter-message-height, 26px);
    margin: var(--chotto-delimiter-message-margin, 21px auto 21px auto);
    border-bottom: var(--chotto-delimiter-message-border-bottom, 1px solid #D9D9D9);
  }

  &__text {
    font-size: var(--chotto-delimiter-message-text-font-size, 14px);
    line-height: var(--chotto-delimiter-message-text-line-height, 1.5);
    text-align: var(--chotto-delimiter-message-text-align, center);
    color: var(--chotto-delimiter-message-text-color, #5F5F5F);
  }
}
</style>
