import puja from "./pujas.js";
import user from "./users.js";

export default (app) => {
  app.use("/api/v1/pujas", puja);
  app.use("/api/v1/users", user);
};
