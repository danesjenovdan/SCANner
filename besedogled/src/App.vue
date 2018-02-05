<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'Besedogled',
};
</script>

<style lang="scss">
  @import 'styles/scaffolding';
  body {
    margin: 0;
    padding: 0;
    background-color: #efeeee;

    .container {
      width: 100%;
      max-width: 968px;
      position: relative;
      margin: auto;

      padding-top: 77px;
    }

    .flex {
      display: flex;

      @include respond-to(mobile) {
        display: block;
      }
    }
  }
</style>
