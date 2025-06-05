$(document).ready(function () {
  $("#levelTitle img").click(function () {
    $("#settingOverlay").css("display", "flex");
  });
  $(".audioCheckBox:last img").hide();
  $(".audioCheckBox").click(function () {
    $(".audioCheckBox img").hide();
    $(this).find("img").show();
  });
  $(".ballCheckBox img").hide();
  $(".ballCheckBox:first img").show();
  $(".ballCheck:first").css("background", "#08C6FE");
  $(".ballCheckBox:first").css("background", "#3171D7");
  $(".ballCheck").click(function () {
    $(".ballCheck")
      .css("background", "#B8CED4")
      .find(".ballCheckBox")
      .css("background", "#70757E")
      .find("img")
      .hide();
    $(this)
      .css("background", "#08C6FE")
      .find(".ballCheckBox")
      .css("background", "#3171D7")
      .find("img")
      .show();
  });
  $("#settingTitle img").click(function () {
    $("#settingOverlay").css("display", "none");
  });
});
