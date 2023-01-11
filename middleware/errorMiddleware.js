// if none of the urls do not exist this function will be called
const notFound = (req, res, next) => {
    // send message with the url that is not found
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
    // if there are further errors then this function is called
const errorHandler = (err, req, res, next) => {
    // return the status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    // return error message
    res.json({
        message: err.message,
    //   provide stack if not in production
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
  
module.exports = { notFound, errorHandler };
  