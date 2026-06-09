import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PixelInjector() {
  useEffect(() => {
    const injectPixels = async () => {
      try {
        const { data: pixels, error } = await supabase
          .from("pixels")
          .select("*")
          .eq("enabled", true);

        if (error || !pixels) {
          console.error("Error fetching pixels for injection:", error);
          return;
        }

        pixels.forEach((pixel) => {
          const { platform, pixel_id } = pixel;
          if (!pixel_id) return;

          switch (platform) {
            case "Facebook":
              if (!(window as any).fbq) {
                (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
                  if (f.fbq) return;
                  n = f.fbq = function() {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                  };
                  if (!f._fbq) f._fbq = n;
                  n.push = n;
                  n.loaded = !0;
                  n.version = '2.0';
                  n.queue = [];
                  t = b.createElement(e);
                  t.async = !0;
                  t.src = v;
                  s = b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t, s);
                })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
              }
              (window as any).fbq('init', pixel_id);
              (window as any).fbq('track', 'PageView');
              break;

            case "Snapchat":
              if (!(window as any).snaptr) {
                (function(e: any, t: any, n: any) {
                  if (e.snaptr) return;
                  var a: any = e.snaptr = function() {
                    a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
                  };
                  a.queue = [];
                  var s = 'script', r = t.createElement(s);
                  r.async = !0;
                  r.src = n;
                  var u = t.getElementsByTagName(s)[0];
                  u.parentNode.insertBefore(r, u);
                })(window, document, 'https://sc-static.net/scevent.min.js');
              }
              (window as any).snaptr('init', pixel_id, {});
              (window as any).snaptr('track', 'PAGE_VIEW');
              break;

            case "TikTok":
              if (!(window as any).ttq) {
                (function (w: any, d: any, t: any) {
                  w.TiktokAnalyticsObject = t;
                  var ttq = w[t] = w[t] || [];
                  ttq.methods = [
                    "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"
                  ];
                  ttq.setAndDefer = function (t: any, e: any) {
                    t[e] = function () {
                      t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                    };
                  };
                  for (var i = 0; i < ttq.methods.length; i++) {
                    ttq.setAndDefer(ttq, ttq.methods[i]);
                  }
                  ttq.instance = function (t: any) {
                    for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) {
                      ttq.setAndDefer(e, ttq.methods[n]);
                    }
                    return e;
                  };
                  ttq.load = function (e: any, n: any) {
                    var t = "https://analytics.tiktok.com/i18n/pixel/events.js";
                    ttq._i = ttq._i || {};
                    ttq._i[e] = [];
                    ttq._i[e]._u = t;
                    ttq._t = ttq._t || +new Date();
                    ttq._o = ttq._o || {};
                    ttq._o[e] = n || {};
                    var o = d.createElement("script");
                    o.type = "text/javascript";
                    o.async = !0;
                    o.src = t + "?sdkid=" + e + "&lib=" + t;
                    var a = d.getElementsByTagName("script")[0];
                    a.parentNode.insertBefore(o, a);
                  };
                })(window, document, 'ttq');
              }
              (window as any).ttq.load(pixel_id);
              (window as any).ttq.page();
              break;

            case "Pinterest":
              if (!(window as any).pintrk) {
                (function(e: string) {
                  if ((window as any).pintrk) return;
                  (window as any).pintrk = function() {
                    (window as any).pintrk.queue.push(Array.prototype.slice.call(arguments));
                  };
                  var n: any = (window as any).pintrk;
                  n.queue = [];
                  n.version = "3.0";
                  var t = document.createElement("script");
                  t.async = !0;
                  t.src = e;
                  var r = document.getElementsByTagName("script")[0];
                  r.parentNode.insertBefore(t, r);
                })("https://s.pinimg.com/sem/js/pin.js");
              }
              (window as any).pintrk('load', pixel_id);
              (window as any).pintrk('page');
              break;

            case "Google Analytics":
              const scriptId = `ga-pixel-${pixel_id}`;
              if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${pixel_id}`;
                document.head.appendChild(script);

                (window as any).dataLayer = (window as any).dataLayer || [];
                const gtagFn = function() {
                  (window as any).dataLayer.push(arguments);
                };
                (window as any).gtag = (window as any).gtag || gtagFn;
                (window as any).gtag('js', new Date());
                (window as any).gtag('config', pixel_id);
              }
              break;

            case "Twitter/X":
              if (!(window as any).twq) {
                (function(e: any, t: any, n: string) {
                  if (e.twq) return;
                  var s: any = e.twq = function() {
                    s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
                  };
                  s.version = '1.1';
                  s.queue = [];
                  var u = t.createElement(n);
                  u.async = !0;
                  u.src = 'https://static.ads-twitter.com/uwt.js';
                  var a = t.getElementsByTagName(n)[0];
                  a.parentNode.insertBefore(u, a);
                })(window, document, 'script');
              }
              (window as any).twq('config', pixel_id);
              (window as any).twq('event', 'PageView');
              break;
          }
        });
      } catch (err) {
        console.error("Failed to inject tracking pixels:", err);
      }
    };

    injectPixels();
  }, []);

  return null;
}
