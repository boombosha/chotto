<template>
  <div class="context-menu__container">
    <ul class="context-menu__list">
      <li
        v-for="(action, index) in props.actions"
        :key="index"
        class="context-menu__item"
        @click="click(index)"
      >
        <!-- Компонент иконки -->
        <component
          v-if="action.icon && typeof action.icon === 'object'"
          :is="action.icon"
          class="context-menu__icon"
        />
        
        <!-- Иконка как URL -->
        <img
          v-else-if="action.icon && typeof action.icon === 'string'"
          :src="action.icon"
          width="18"
          height="18"
          class="context-menu__icon"
        >
        
        <!-- PrimeVue иконка -->
        <i 
          v-else-if="action.prime"
          :class="'pi pi-' + action.prime"
          class="context-menu__icon" 
        />
        
        <span 
          v-if="action.title" 
          style="white-space: nowrap;"
        >
          {{ action.title }}
        </span>
        <span v-if="action.description">{{ action.description }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  actions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['click']);

const click = (index) => {
  const action = props.actions[index];
  emit('click', action);
}
</script>

<style
  scoped
  lang="scss"
>
.context-menu {
  
  &__container {
    display: none;
    font-weight: var(--chotto-container-font-weight);
    color: var(--chotto-primary-text-color);
    font-family: var(--chotto-container-font-family);
    z-index: 1000;
    position: absolute;
    width: max-content;
    box-shadow: 0px 2px 10px 1px var(--chotto-shadow-light-color);
    border-radius: var(--chotto-context-menu-border-radius, 8px);
    font-size: var(--chotto-context-menu-font-size, var(--chotto-title-font-size));
    color: var(--chotto-primary-text-color);
    background-color: var(--chotto-primary-color);
  }

  &__list {
    padding: 12px 0 10px 0;
    margin: 0;
    display: grid;
    flex-direction: column;
    align-items: flex-start;
    row-gap: var(--chotto-context-menu-items-row-gap, 6px);
    padding-left: 0px;
    min-width: 115px;
  }

  &__item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    padding: 6px 16px;
    width: inherit;
    gap: 12px; /* Добавлен отступ между иконкой и текстом */
  }

  &__item:hover {
    background-color: var(--neutral-150);
  }

  &__item:not(:last-child) {
    border-bottom: 1px solid var(--chotto-context-menu-border-color, var(--chotto-item-border-color));
  }

  &__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
}
</style>