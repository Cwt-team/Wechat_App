Page({
  data: {
    suggestionHistory: []
  },
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('transferSuggestionHistory', (data) => {
      this.setData({
        suggestionHistory: data.suggestionHistory
      });
    });
  }
});