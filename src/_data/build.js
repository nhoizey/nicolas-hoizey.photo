const thisTimestamp = new Date();

export const env = process.env.ELEVENTY_RUN_MODE;

export const timestamp = thisTimestamp;

export const id = thisTimestamp.valueOf();
