<template>
  <div class="dots-loader">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</template>
<style scoped>
.dots-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px; /* 点间距 */
  width: 100%;
  height: 100%;
}

.dot {
  width: 12px;
  height: 12px;
  background: #3498db;
  border-radius: 50%;
  animation: bounce 1.4s infinite; /* 弹性动画 */
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
} /* 第二点延迟 */
.dot:nth-child(3) {
  animation-delay: 0.4s;
} /* 第三点延迟 */

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  } /* 底部位置 */
  50% {
    transform: translateY(-15px);
  } /* 跳到最高点 */
}
</style>
