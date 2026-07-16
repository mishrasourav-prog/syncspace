let shuttingDown = false;

/*
|--------------------------------------------------------------------------
| Begin Shutdown
|--------------------------------------------------------------------------
|
| Once shutdown starts, readiness checks should fail so a reverse proxy
| or deployment platform stops routing new traffic to this process.
|
*/

export const markServerAsShuttingDown =
    (): void => {
        shuttingDown = true;
    };

/*
|--------------------------------------------------------------------------
| Read Shutdown State
|--------------------------------------------------------------------------
*/

export const isServerShuttingDown =
    (): boolean => {
        return shuttingDown;
    };


    