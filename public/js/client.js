const socket = io({
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTlmZWFmYmQ2YTcwODJjNDRmYmUwZjUiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZW1haWwiOiJleGFtcGxlc2hhaWtoMTIzQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidGVzdFVzZXIiLCJpYXQiOjE3MDUwNTYxMTcsImV4cCI6MTcwNjM1MjExN30.Ph8Jdtnu1P7_xprrBy5jAx8sB1Plamag2C_AOBvGzOs',
  },
  query: {
    kela: "Kalwa"
  }
});