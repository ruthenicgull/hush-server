import { ApiError } from "./ApiError.js";

export default function errorHandler(err, req, res, next) {
  console.log(err);
  console.error(err.stack);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  }

  res.status(500).json({ message: "Something went wrong" });
}
