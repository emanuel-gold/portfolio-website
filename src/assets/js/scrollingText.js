(() => {
  "use strict";
  const defaultAnimationSettings = {
    animationSpeed: 1000,
    animationPause: 4000,
    animationEasingFunction: "cubic-bezier(0.2, 0.2, 0, 1.00)",
  };

  const getAnimationSettings = (scriptElement) => {
    if (!scriptElement) return defaultAnimationSettings;

    try {
      return {
        ...defaultAnimationSettings,
        ...JSON.parse(scriptElement.textContent),
      };
    } catch (error) {
      console.warn("Invalid animation settings provided", error);
      return defaultAnimationSettings;
    }
  };

  const setScrollTransition = (
    element,
    scrollTime,
    easingFunction,
    animate
  ) => {
    element.style.transition = animate
      ? `transform ${scrollTime}ms ${easingFunction}`
      : "none";
  };

  const initializePageHeaderScrollingText = () => {
    const pageHeaderHumanModules = document.querySelectorAll(
      ".heading-h-readable"
    );
    if (!pageHeaderHumanModules.length) return;

    pageHeaderHumanModules.forEach((module) => {
      const heroElement = module;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const list = heroElement.querySelector(".hero_header-scrolling-list");
      if (!list) return;
      const animationSettingsScript = heroElement.querySelector(
        'script[id="heading-h-readable_scroll-animation-settings"]'
      );
      const settings = getAnimationSettings(animationSettingsScript);
      const {
        animationSpeed,
        animationPause,
        animationEasingFunction,
      } = settings;

      const scrollTime = animationSpeed;
      const pauseTime = animationPause;
      const easingFunction = animationEasingFunction;
      const listItems = list.querySelectorAll(".header-scrolling-list-item");
      const itemCount = listItems.length - 1;

      const getItemHeight = () => {
        const firstItem = listItems[0];
        return firstItem ? firstItem.getBoundingClientRect().height : 240;
      };

      let itemHeight = getItemHeight();

      heroElement.style.setProperty(
        "--hero-heading-scroll-height",
        `${itemHeight}px`
      );

      let animationTimeout;
      let currentIndex = 0;

      const scrollTo = (index, animate = true) => {
        setScrollTransition(list, scrollTime, easingFunction, animate);
        list.style.transform = `translateY(-${index * itemHeight}px)`;
      };

      const resetAnimation = () => {
        currentIndex = 0;
        scrollTo(0, false);
      };

      const animateToNext = () => {
        currentIndex += 1;
        scrollTo(currentIndex);

        if (currentIndex < itemCount) {
          animationTimeout = setTimeout(animateToNext, pauseTime + scrollTime);
          return;
        }

        animationTimeout = setTimeout(() => {
          resetAnimation();
          animationTimeout = setTimeout(animateToNext, pauseTime);
        }, pauseTime);
      };

      const startAnimation = () => {
        itemHeight = getItemHeight();
        heroElement.style.setProperty(
          "--hero-heading-scroll-height",
          `${itemHeight}px`
        );
        resetAnimation();
        animationTimeout = setTimeout(animateToNext, pauseTime);
      };

      const stopAnimation = () => {
        if (animationTimeout) {
          clearTimeout(animationTimeout);
          animationTimeout = null;
        }
        resetAnimation();
      };

      // Recalculate on resize
      let resizeTimeout;
      const resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const newHeight = getItemHeight();
          if (Math.abs(newHeight - itemHeight) > 2) {
            itemHeight = newHeight;
            heroElement.style.setProperty(
              "--hero-heading-scroll-height",
              `${itemHeight}px`
            );
            stopAnimation();
            startAnimation();
          }
        }, 200);
      });

      if (listItems[0]) {
        resizeObserver.observe(listItems[0]);
      }

      // Start immediately — no breakpoint restriction
      startAnimation();
    });
  };
  "loading" === document.readyState
    ? document.addEventListener(
        "DOMContentLoaded",
        initializePageHeaderScrollingText
      )
    : initializePageHeaderScrollingText();
})();