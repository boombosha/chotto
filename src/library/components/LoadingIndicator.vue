<template>
  <div 
    v-if="isLoading" 
    class="messages-loading-indicator"
  >
    <svg
      width="120px"
      height="116px"
      viewBox="-8 -8 120 116"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        class="dot dot-1"
        cx="51.75"
        cy="18.82"
        rx="12.18"
        ry="12.14"
      />
      <ellipse
        class="dot dot-2"
        cx="84.42"
        cy="42.24"
        rx="12.18"
        ry="12.14"
      />
      <ellipse
        class="dot dot-3"
        cx="72.00"
        cy="80.35"
        rx="12.18"
        ry="12.14"
      />
      <ellipse
        class="dot dot-4"
        cx="31.51"
        cy="80.35"
        rx="12.18"
        ry="12.14"
      />
      <ellipse
        class="dot dot-5"
        cx="18.86"
        cy="42.24"
        rx="12.18"
        ry="12.14"
      />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.messages-loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.dot {
  stroke: #C9333C;
  stroke-width: 13.36;
  fill: none;
  animation: pulse 0.8s infinite ease-in-out;
}

.dot-1 { animation-delay: 0.0s; }
.dot-2 { animation-delay: 0.16s; }
.dot-3 { animation-delay: 0.32s; }
.dot-4 { animation-delay: 0.48s; }
.dot-5 { animation-delay: 0.64s; }

@keyframes pulse {
  0%, 100% { opacity: 0.4; stroke-width: 8; }
  50%       { opacity: 1;   stroke-width: 16; }
}
</style>
