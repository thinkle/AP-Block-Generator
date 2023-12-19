<script>
</script>

<div class="info-icon">
  ℹ️
  <span class="tooltip"><slot /></span>
</div>

<style>
  .info-icon {
    display: inline-block;
    cursor: pointer;
    position: relative;
    font-size: x-small;
    vertical-align: super;
  }

  .tooltip {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
    top: 125%;
    right: 0;
    margin-left: -60px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .info-icon:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
</style>
