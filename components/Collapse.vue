<template>
    <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
      <input type="checkbox" class="peer" />
      <div class="collapse-title text-lg font-medium">
        {{ title }}
      </div>
      <div class="collapse-content">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  const props = defineProps({
    title: {
      type: String,
      required: true
    }
  })
  </script>
  
  <style scoped>
  /* Add any additional custom styles here */
  </style>