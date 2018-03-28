<template>
  <div id="footer">
    <div class="container">
      <a href="http://ebsi.eu/">Evropski inštitut za vedenjske študije</a>
      <a href="http://danesjenovdan.si/">Danes je nov dan</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BFooter',

  mounted() {
    console.log('ping');
  },
};
</script>

<style lang="scss" scoped>
  #footer {
    padding-bottom: 40px;

    .container {
      border-top: 3px solid #b5b4b4;
      margin-top: 20px;
      padding-top: 40px;

      a {
        display: block;
        position: relative;
        margin: auto;
        text-align: center;
        width: 100%;
        color: #6a6969;
        font-family: "Open Sans";
        font-size: 13px;
        font-weight: 400;
        line-height: 30px;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
