// This is stupid, meant to work only for the "window" object in client-side
// testing. That is, mostly Karma

var TelQMock = {
  'get': function fakeGet() { }
};

if(window) {
  window.q = TelQMock;
}
