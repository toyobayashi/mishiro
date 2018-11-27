<template>
  <div class="combo" v-show="combo > 0">
    <span class="combo-number">{{combo}}</span>
    <span class="combo-text">combo</span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop() combo: number
}
</script>
