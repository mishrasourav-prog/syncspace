let shuttingDown = false;

export const markServerAsShuttingDown = (): void => {
  shuttingDown = true;
};

export const isServerShuttingDown = (): boolean => {
  return shuttingDown;
};
