import Wrapper from "@/components/Wrapper";
import Sidebar from "@/components/navigation/Sidebar";
import Providers from "@/context/providers";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Suspense, lazy, useEffect, useState } from "react";
import { isDesktop, isMobile } from "react-device-detect";
import Statusbar from "./components/Statusbar";
import Bottombar from "./components/navigation/Bottombar";
import { Redirect } from "./components/navigation/Redirect";
import { cn } from "./lib/utils";
import { isPWA } from "./utils/isPWA";

const Live = lazy(() => import("@/pages/Live"));
const Events = lazy(() => import("@/pages/Events"));
const Exports = lazy(() => import("@/pages/Exports"));
const SubmitPlus = lazy(() => import("@/pages/SubmitPlus"));
const ConfigEditor = lazy(() => import("@/pages/ConfigEditor"));
const System = lazy(() => import("@/pages/System"));
const Settings = lazy(() => import("@/pages/Settings"));
const UIPlayground = lazy(() => import("@/pages/UIPlayground"));
const Logs = lazy(() => import("@/pages/Logs"));

function App() {
  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    const listener = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener("resize", listener);

    setTimeout(() => listener(), 50);

    setIsPortrait(true);

    return () => window.removeEventListener("resize", listener);
  }, []);

  return (
    <Providers>
      <BrowserRouter basename={window.baseUrl}>
        <Wrapper>
          <div className="size-full overflow-hidden">
            {isDesktop && <Sidebar />}
            {isDesktop && <Statusbar />}
            {isMobile && (isPortrait ? <Bottombar /> : <Sidebar />)}
            <div
              id="pageRoot"
              className={cn(
                "absolute right-0 top-0 overflow-hidden",
                isMobile ? `bottom-${isPWA ? 16 : 12}` : "bottom-8",
                isMobile && !isPortrait
                  ? "bottom-0 left-[52px]"
                  : "bottom-14 left-0 md:bottom-16",
              )}
            >
              <Suspense>
                <Routes>
                  <Route index element={<Live />} />
                  <Route path="/events" element={<Redirect to="/review" />} />
                  <Route path="/review" element={<Events />} />
                  <Route path="/export" element={<Exports />} />
                  <Route path="/plus" element={<SubmitPlus />} />
                  <Route path="/system" element={<System />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/config" element={<ConfigEditor />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/playground" element={<UIPlayground />} />
                  <Route path="*" element={<Redirect to="/" />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </Wrapper>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
