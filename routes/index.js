import pujas from "./pujas.js";

export default (app) => {
  app.use("/api/v1/pujas", pujas);
};
