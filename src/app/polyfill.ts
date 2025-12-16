"use client";

import ReactDOM from "react-dom";

// React 19 removed unstable_batchedUpdates, which Ant Design v5 / rc-util relies on.
// This polyfill restores it as a no-op (or direct equivalent) to prevent crashes.
// We apply this universally (Client & SSR) because Next.js renders Client Components on the server.

// @ts-ignore
if (ReactDOM && !ReactDOM.unstable_batchedUpdates) {
    // @ts-ignore
    ReactDOM.unstable_batchedUpdates = (cb) => {
        cb();
    };
}
