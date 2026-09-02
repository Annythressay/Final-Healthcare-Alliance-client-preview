const header = document.querySelector(".header");
const toggle = document.querySelector(".header-toggle");
const navLinks = document.querySelectorAll(".header-nav a");
const translateInterfaceText = (text) =>
  typeof window.getTranslation === "function" ? window.getTranslation(text) : text;

const isHomepage =
  document.body.classList.contains("home") ||
  document.body.classList.contains("front-page");

navLinks.forEach((link) => {
  link.classList.toggle(
    "is-active",
    isHomepage && link.dataset.navPage === "home"
  );
});

if (header && toggle) {
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      translateInterfaceText(isOpen ? "Đóng menu" : "Mở menu")
    );
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", translateInterfaceText("Mở menu"));
    });
  });
}

const contactFloat = document.querySelector("[data-contact-float]");

if (contactFloat) {
  const contactToggle = contactFloat.querySelector(".contact-float-toggle");
  const contactLinks = contactFloat.querySelectorAll(".contact-float-link");

  const setContactMenu = (isOpen) => {
    contactFloat.classList.toggle("is-open", isOpen);
    contactToggle.setAttribute("aria-expanded", String(isOpen));
    contactToggle.setAttribute(
      "aria-label",
      translateInterfaceText(isOpen ? "Đóng các kênh liên hệ" : "Mở các kênh liên hệ")
    );
  };

  contactToggle.addEventListener("click", () => {
    setContactMenu(!contactFloat.classList.contains("is-open"));
  });

  contactLinks.forEach((link) => {
    link.addEventListener("click", () => setContactMenu(false));
  });

  document.addEventListener("click", (event) => {
    if (!contactFloat.contains(event.target)) {
      setContactMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !contactFloat.classList.contains("is-open")) return;

    setContactMenu(false);
    contactToggle.focus();
  });
}

const solutionsSection = document.querySelector(".solutions");

if (solutionsSection) {
  const supportsSolutionHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const solutionToggles = solutionsSection.querySelectorAll(
    ".service-card-toggle"
  );

  const setSolutionDetailState = (card, isOpen, isPinned = false) => {
    const toggleButton = card.querySelector(".service-card-toggle");
    const detailPanel = card.querySelector(".service-card-detail");

    if (!toggleButton || !detailPanel) return;

    card.classList.toggle("is-detail-open", isOpen);
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleButton.setAttribute(
      "aria-label",
      translateInterfaceText(
        isOpen ? "Hide solution details" : "Show solution details"
      )
    );
    detailPanel.setAttribute("aria-hidden", String(!isOpen));

    if (isPinned && isOpen) {
      card.dataset.detailPinned = "true";
    } else if (!isOpen) {
      delete card.dataset.detailPinned;
    }
  };

  solutionToggles.forEach((toggleButton) => {
    const card = toggleButton.closest(".service-card");

    if (!card) return;

    toggleButton.addEventListener("click", () => {
      const isOpen = card.classList.contains("is-detail-open");
      const isPinned = card.dataset.detailPinned === "true";

      setSolutionDetailState(card, !isOpen || !isPinned, true);
    });

    if (!supportsSolutionHover) return;

    toggleButton.addEventListener("mouseenter", () => {
      if (card.dataset.detailPinned !== "true") {
        setSolutionDetailState(card, true);
      }
    });

    card.addEventListener("mouseleave", () => {
      if (card.dataset.detailPinned !== "true") {
        setSolutionDetailState(card, false);
      }
    });
  });
}

const activityShowcase = document.querySelector(".activity-showcase");

if (activityShowcase) {
  const ACTIVITY_ITEMS_PER_PAGE = 4;
  const activityGrid = activityShowcase.querySelector("[data-activity-grid]");
  const activityFilters = Array.from(
    activityShowcase.querySelectorAll(".activity-filter")
  );
  const activityCards = Array.from(
    activityShowcase.querySelectorAll(".activity-card")
  );
  let activeActivityFilter =
    activityFilters.find((filter) => filter.classList.contains("is-active"))
      ?.dataset.activityFilter || "all";
  let currentActivityPage = 1;

  if (activityGrid && activityFilters.length && activityCards.length) {
    const activityPagination = document.createElement("nav");
    const previousButton = document.createElement("button");
    const pageButtons = document.createElement("div");
    const nextButton = document.createElement("button");
    const pageStatus = document.createElement("span");

    activityPagination.className = "activity-pagination";
    previousButton.className =
      "activity-pagination-button activity-pagination-previous";
    previousButton.type = "button";
    previousButton.dataset.activityPaginationAction = "previous";
    pageButtons.className = "activity-pagination-pages";
    nextButton.className =
      "activity-pagination-button activity-pagination-next";
    nextButton.type = "button";
    nextButton.dataset.activityPaginationAction = "next";
    pageStatus.className = "activity-pagination-status";
    pageStatus.setAttribute("aria-live", "polite");
    activityPagination.append(previousButton, pageButtons, nextButton, pageStatus);
    activityGrid.insertAdjacentElement("afterend", activityPagination);

    const getPaginationLabel = (source, replacements = {}) => {
      let label = translateInterfaceText(source);

      Object.entries(replacements).forEach(([key, value]) => {
        label = label.replace(`{${key}}`, value);
      });

      return label;
    };

    const updateActivityView = () => {
      const focusedPage = activityPagination.contains(document.activeElement)
        ? document.activeElement.dataset.activityPaginationPage
        : null;
      const matchingCards = activityCards.filter(
        (card) =>
          activeActivityFilter === "all" ||
          card.dataset.activityGroup === activeActivityFilter
      );
      const totalPages = Math.max(
        1,
        Math.ceil(matchingCards.length / ACTIVITY_ITEMS_PER_PAGE)
      );

      currentActivityPage = Math.min(currentActivityPage, totalPages);
      const pageStart = (currentActivityPage - 1) * ACTIVITY_ITEMS_PER_PAGE;
      const visibleCards = new Set(
        matchingCards.slice(pageStart, pageStart + ACTIVITY_ITEMS_PER_PAGE)
      );

      activityCards.forEach((card) => {
        card.hidden = !visibleCards.has(card);
      });

      activityPagination.hidden = totalPages <= 1;
      activityPagination.setAttribute(
        "aria-label",
        translateInterfaceText("Phân trang hoạt động")
      );
      previousButton.textContent = translateInterfaceText("Trang trước");
      previousButton.disabled = currentActivityPage === 1;
      nextButton.textContent = translateInterfaceText("Trang sau");
      nextButton.disabled = currentActivityPage === totalPages;
      pageStatus.textContent = getPaginationLabel("Trang {current} / {total}", {
        current: currentActivityPage,
        total: totalPages,
      });
      pageButtons.replaceChildren();

      for (let page = 1; page <= totalPages; page += 1) {
        const pageButton = document.createElement("button");

        pageButton.className = "activity-pagination-button activity-pagination-page";
        pageButton.type = "button";
        pageButton.dataset.activityPaginationPage = String(page);
        pageButton.textContent = String(page);
        pageButton.setAttribute(
          "aria-label",
          getPaginationLabel("Trang {current} / {total}", {
            current: page,
            total: totalPages,
          })
        );

        if (page === currentActivityPage) {
          pageButton.setAttribute("aria-current", "page");
        }

        pageButtons.append(pageButton);
      }

      if (focusedPage) {
        pageButtons
          .querySelector(
            `[data-activity-pagination-page="${currentActivityPage}"]`
          )
          ?.focus();
      }
    };

    activityFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        activeActivityFilter = filter.dataset.activityFilter;
        currentActivityPage = 1;

        activityFilters.forEach((item) => {
          const isActive = item === filter;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        updateActivityView();
      });
    });

    activityPagination.addEventListener("click", (event) => {
      const button = event.target.closest("button");

      if (!button || button.disabled) return;

      if (button.dataset.activityPaginationPage) {
        currentActivityPage = Number(button.dataset.activityPaginationPage);
      } else if (button.dataset.activityPaginationAction === "previous") {
        currentActivityPage -= 1;
      } else if (button.dataset.activityPaginationAction === "next") {
        currentActivityPage += 1;
      } else {
        return;
      }

      updateActivityView();
    });

    window.addEventListener("languagechange", updateActivityView);
    updateActivityView();
  }
}

const activityPage = document.querySelector("[data-activity-page]");

if (activityPage) {
  const itemsPerPage = Number(activityPage.dataset.itemsPerPage) || 7;
  const records = Array.from(
    activityPage.querySelectorAll("[data-activity-page-record]")
  );
  const filters = Array.from(
    activityPage.querySelectorAll("[data-activity-page-filter]")
  );
  const searchInput = activityPage.querySelector("[data-activity-page-search]");
  const sortSelect = activityPage.querySelector("[data-activity-page-sort]");
  const results = activityPage.querySelector(".activity-page-results");
  const featuredSlot = activityPage.querySelector("[data-activity-page-featured]");
  const grid = activityPage.querySelector("[data-activity-page-grid]");
  const emptyState = activityPage.querySelector("[data-activity-page-empty]");
  const pagination = activityPage.querySelector("[data-activity-page-pagination]");
  const paginationPages = activityPage.querySelector(
    "[data-activity-page-pagination-pages]"
  );
  const paginationStatus = activityPage.querySelector(
    "[data-activity-page-pagination-status]"
  );
  const previousButton = pagination?.querySelector(
    '[data-activity-page-action="previous"]'
  );
  const nextButton = pagination?.querySelector(
    '[data-activity-page-action="next"]'
  );
  let activeFilter = "all";
  let currentPageNumber = 1;

  const getRecordText = (record, selector) =>
    record.querySelector(selector)?.textContent.trim() || "";

  const normalizeSearchText = (value) =>
    value.toLocaleLowerCase().replace(/\s+/g, " ").trim();

  const getPaginationLabel = (source, replacements = {}) => {
    let label = translateInterfaceText(source);

    Object.entries(replacements).forEach(([key, value]) => {
      label = label.replace(`{${key}}`, value);
    });

    return label;
  };

  const appendRecordImage = (record, container, isFeatured = false) => {
    const image = record.querySelector("[data-record-image] img")?.cloneNode(true);

    if (!image) return;
    if (isFeatured) {
      image.removeAttribute("loading");
      image.setAttribute("fetchpriority", "high");
    }
    container.append(image);
  };

  const createMeta = (record) => {
    const meta = document.createElement("div");
    const group = document.createElement("span");
    const date = document.createElement("time");
    const normalizedDate = record.dataset.activitySortDate;

    meta.className = "activity-page-card-meta";
    group.className = "activity-page-card-category";
    group.textContent = getRecordText(record, "[data-record-group]");
    date.textContent = getRecordText(record, "[data-record-date]");
    if (normalizedDate) date.dateTime = normalizedDate;
    meta.append(group, date);
    return meta;
  };

  const createReadMoreLink = (record, className) => {
    const sourceLink = record.querySelector("[data-record-url]");
    if (!sourceLink?.href) return null;

    const link = document.createElement("a");
    const icon = document.createElement("i");

    link.className = className;
    link.href = sourceLink.href;
    link.append(document.createTextNode(translateInterfaceText("Xem thêm")));
    icon.className = "fa-solid fa-arrow-right";
    icon.setAttribute("aria-hidden", "true");
    link.append(icon);
    return link;
  };

  const createSourceLink = (record) => {
    const source = record.querySelector("[data-record-source]");
    if (!source) return null;

    const element = document.createElement(source.matches("a") ? "a" : "span");
    element.className = "activity-page-card-source";
    element.textContent = source.textContent.trim();
    if (source.matches("a") && source.href) {
      element.href = source.href;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
      element.append(document.createTextNode(" ↗"));
    }
    return element;
  };

  const createFeaturedCard = (record) => {
    const article = document.createElement("article");
    const image = document.createElement("div");
    const content = document.createElement("div");
    const label = document.createElement("p");
    const title = document.createElement("h2");
    const summary = document.createElement("p");
    const footer = document.createElement("div");
    const readMore = createReadMoreLink(
      record,
      "activity-page-featured-link button button-orange"
    );
    const source = createSourceLink(record);

    article.className = "activity-page-featured";
    image.className = "activity-page-featured-image";
    content.className = "activity-page-featured-content";
    label.className = "activity-page-featured-label";
    title.className = "activity-page-featured-title";
    summary.className = "activity-page-featured-summary";
    footer.className = "activity-page-featured-footer";
    label.textContent = getRecordText(record, "[data-record-label]");
    title.textContent = getRecordText(record, "[data-record-title]");
    summary.textContent = getRecordText(record, "[data-record-summary]");
    appendRecordImage(record, image, true);
    if (readMore) footer.append(readMore);
    if (source) footer.append(source);
    content.append(createMeta(record));
    if (label.textContent) content.append(label);
    content.append(title, summary, footer);
    article.append(image, content);
    return article;
  };

  const createGridCard = (record) => {
    const article = document.createElement("article");
    const image = document.createElement("div");
    const content = document.createElement("div");
    const label = document.createElement("p");
    const title = document.createElement("h3");
    const summary = document.createElement("p");
    const footer = document.createElement("div");
    const readMore = createReadMoreLink(record, "activity-page-card-link");
    const source = createSourceLink(record);

    article.className = "activity-page-card";
    image.className = "activity-page-card-image";
    content.className = "activity-page-card-content";
    label.className = "activity-page-card-label";
    title.className = "activity-page-card-title";
    summary.className = "activity-page-card-summary";
    footer.className = "activity-page-card-footer";
    label.textContent = getRecordText(record, "[data-record-label]");
    title.textContent = getRecordText(record, "[data-record-title]");
    summary.textContent = getRecordText(record, "[data-record-summary]");
    appendRecordImage(record, image);
    if (readMore) footer.append(readMore);
    if (source) footer.append(source);
    content.append(createMeta(record));
    if (label.textContent) content.append(label);
    content.append(title, summary, footer);
    article.append(image, content);
    return article;
  };

  const getVisibleRecords = () => {
    const searchTerm = normalizeSearchText(searchInput?.value || "");
    const sortDirection = sortSelect?.value === "oldest" ? 1 : -1;

    return records
      .filter((record) => {
        if (
          activeFilter !== "all" &&
          record.dataset.activityGroup !== activeFilter
        ) {
          return false;
        }

        const haystack = normalizeSearchText(
          [
            getRecordText(record, "[data-record-title]"),
            getRecordText(record, "[data-record-summary]"),
            getRecordText(record, "[data-record-label]"),
            getRecordText(record, "[data-record-source]"),
          ].join(" ")
        );
        return !searchTerm || haystack.includes(searchTerm);
      })
      .sort((left, right) => {
        const leftDate = Date.parse(`${left.dataset.activitySortDate}T00:00:00Z`) || 0;
        const rightDate = Date.parse(`${right.dataset.activitySortDate}T00:00:00Z`) || 0;
        const dateDifference = (leftDate - rightDate) * sortDirection;

        if (dateDifference) return dateDifference;
        return (
          Number(left.dataset.activityDisplayOrder || 0) -
          Number(right.dataset.activityDisplayOrder || 0)
        );
      });
  };

  const updateActivityPage = () => {
    if (
      !results ||
      !featuredSlot ||
      !grid ||
      !emptyState ||
      !pagination ||
      !paginationPages ||
      !paginationStatus ||
      !previousButton ||
      !nextButton
    ) {
      return;
    }

    results.setAttribute("aria-busy", "true");
    const matchingRecords = getVisibleRecords();
    const totalPages = Math.max(1, Math.ceil(matchingRecords.length / itemsPerPage));
    currentPageNumber = Math.min(currentPageNumber, totalPages);
    const startIndex = (currentPageNumber - 1) * itemsPerPage;
    const pageRecords = matchingRecords.slice(startIndex, startIndex + itemsPerPage);

    featuredSlot.replaceChildren();
    grid.replaceChildren();
    paginationPages.replaceChildren();
    emptyState.textContent = translateInterfaceText(
      "Không tìm thấy hoạt động phù hợp."
    );
    emptyState.hidden = pageRecords.length > 0;

    if (pageRecords.length) {
      featuredSlot.append(createFeaturedCard(pageRecords[0]));
      pageRecords.slice(1).forEach((record) => grid.append(createGridCard(record)));
    }

    pagination.hidden = matchingRecords.length === 0 || totalPages <= 1;
    pagination.setAttribute(
      "aria-label",
      translateInterfaceText("Phân trang hoạt động")
    );
    const latestOption = sortSelect?.querySelector('[value="latest"]');
    const oldestOption = sortSelect?.querySelector('[value="oldest"]');
    if (latestOption) latestOption.textContent = translateInterfaceText("Mới nhất");
    if (oldestOption) oldestOption.textContent = translateInterfaceText("Cũ nhất");
    previousButton.textContent = translateInterfaceText("Trang trước");
    previousButton.disabled = currentPageNumber === 1;
    nextButton.textContent = translateInterfaceText("Trang sau");
    nextButton.disabled = currentPageNumber === totalPages;
    paginationStatus.textContent = getPaginationLabel(
      "Trang {current} / {total}",
      {
        current: currentPageNumber,
        total: totalPages,
      }
    );

    for (let page = 1; page <= totalPages; page += 1) {
      const button = document.createElement("button");
      button.className = "activity-page-pagination-button";
      button.type = "button";
      button.dataset.activityPageNumber = String(page);
      button.textContent = String(page);
      button.setAttribute(
        "aria-label",
        getPaginationLabel("Trang {current} / {total}", {
          current: page,
          total: totalPages,
        })
      );
      if (page === currentPageNumber) button.setAttribute("aria-current", "page");
      paginationPages.append(button);
    }

    results.setAttribute("aria-busy", "false");
  };

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      activeFilter = filter.dataset.activityPageFilter || "all";
      currentPageNumber = 1;
      filters.forEach((item) => {
        const isActive = item === filter;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      updateActivityPage();
    });
  });

  searchInput?.addEventListener("input", () => {
    currentPageNumber = 1;
    updateActivityPage();
  });

  sortSelect?.addEventListener("change", () => {
    currentPageNumber = 1;
    updateActivityPage();
  });

  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;

    if (button.dataset.activityPageNumber) {
      currentPageNumber = Number(button.dataset.activityPageNumber);
    } else if (button.dataset.activityPageAction === "previous") {
      currentPageNumber -= 1;
    } else if (button.dataset.activityPageAction === "next") {
      currentPageNumber += 1;
    } else {
      return;
    }
    updateActivityPage();
    results?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("languagechange", updateActivityPage);
  updateActivityPage();
}

const relatedActivities = document.querySelector("[data-activity-related]");
const activityShareLinks = document.querySelectorAll("[data-share-service]");

if (activityShareLinks.length) {
  const currentActivityUrl = window.location.href.split("#")[0];
  const currentActivityTitle = document.querySelector(".activity-detail-header h1")
    ?.textContent.trim() || document.title;
  const encodedActivityUrl = encodeURIComponent(currentActivityUrl);
  const encodedActivityTitle = encodeURIComponent(currentActivityTitle);

  const updateActivityShareLinks = () => {
    activityShareLinks.forEach((link) => {
      const service = link.dataset.shareService;

      if (service === "linkedin") {
        link.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedActivityUrl}`;
      } else if (service === "facebook") {
        link.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedActivityUrl}`;
      } else if (service === "x") {
        link.href = `https://twitter.com/intent/tweet?url=${encodedActivityUrl}&text=${encodedActivityTitle}`;
      } else if (service === "email") {
        link.href = `mailto:?subject=${encodeURIComponent(`${translateInterfaceText("Hoạt động:")} ${currentActivityTitle}`)}&body=${encodeURIComponent(`${currentActivityTitle}\n\n${currentActivityUrl}`)}`;
      }
    });
  };

  window.addEventListener("languagechange", updateActivityShareLinks);
  updateActivityShareLinks();
}

if (relatedActivities) {
  const relatedCards = Array.from(
    relatedActivities.querySelectorAll("[data-related-card]")
  );
  const previousRelated = relatedActivities.querySelector(
    '[data-related-action="previous"]'
  );
  const nextRelated = relatedActivities.querySelector(
    '[data-related-action="next"]'
  );
  const relatedStatus = relatedActivities.querySelector("[data-related-status]");
  let relatedPage = 0;
  let relatedItemsPerPage = 3;

  const getRelatedItemsPerPage = () => {
    if (window.innerWidth <= 575) return 1;
    if (window.innerWidth <= 991) return 2;
    return 3;
  };

  const getRelatedStatus = (current, total) =>
    translateInterfaceText("Trang hoạt động liên quan {current} / {total}")
      .replace("{current}", String(current))
      .replace("{total}", String(total));

  const updateRelatedActivities = (resetPage = false) => {
    relatedItemsPerPage = getRelatedItemsPerPage();
    const totalPages = Math.max(
      1,
      Math.ceil(relatedCards.length / relatedItemsPerPage)
    );

    if (resetPage) relatedPage = 0;
    relatedPage = Math.min(relatedPage, totalPages - 1);
    const start = relatedPage * relatedItemsPerPage;
    const visibleCards = new Set(
      relatedCards.slice(start, start + relatedItemsPerPage)
    );

    relatedCards.forEach((card) => {
      card.hidden = !visibleCards.has(card);
    });

    if (previousRelated) {
      previousRelated.disabled = relatedPage === 0;
      previousRelated.setAttribute(
        "aria-label",
        translateInterfaceText("Hoạt động liên quan trước")
      );
    }
    if (nextRelated) {
      nextRelated.disabled = relatedPage === totalPages - 1;
      nextRelated.setAttribute(
        "aria-label",
        translateInterfaceText("Hoạt động liên quan tiếp theo")
      );
    }
    if (relatedStatus) {
      relatedStatus.textContent = getRelatedStatus(relatedPage + 1, totalPages);
    }
  };

  previousRelated?.addEventListener("click", () => {
    relatedPage -= 1;
    updateRelatedActivities();
  });

  nextRelated?.addEventListener("click", () => {
    relatedPage += 1;
    updateRelatedActivities();
  });

  window.addEventListener("resize", () => updateRelatedActivities(true));
  window.addEventListener("languagechange", () => updateRelatedActivities());
  updateRelatedActivities();
}

const statsSection = document.querySelector(".stats");
const statValueElements = document.querySelectorAll(".stats .inner-value");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const countableStats = Array.from(statValueElements)
  .map((element) => {
    const originalValue = element.textContent.trim();
    const valueParts = originalValue.match(/^([\d,]+)(.*)$/);

    if (!valueParts) return null;

    const numberText = valueParts[1];
    const suffix = valueParts[2];
    const target = Number(numberText.replaceAll(",", ""));
    const minimumLength = numberText.startsWith("0") ? numberText.length : 0;
    const usesThousandsSeparator = numberText.includes(",");
    const formatValue = (value) => {
      const formattedNumber = usesThousandsSeparator
        ? value.toLocaleString("en-US")
        : String(value).padStart(minimumLength, "0");

      return `${formattedNumber}${suffix}`;
    };

    element.setAttribute("aria-label", originalValue);

    if (!prefersReducedMotion) {
      element.textContent = formatValue(0);
    }

    return { element, target, formatValue };
  })
  .filter(Boolean);

const animateStatValue = ({ element, target, formatValue }) => {
  if (element.dataset.counted === "true") return;

  element.dataset.counted = "true";

  if (prefersReducedMotion) {
    element.textContent = formatValue(target);
    return;
  }

  const duration = 1600;
  const startTime = performance.now();

  const updateValue = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * easedProgress);

    element.textContent = formatValue(currentValue);

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    }
  };

  requestAnimationFrame(updateValue);
};

const startStatsCounter = () => {
  countableStats.forEach(animateStatValue);
};

if (statsSection && countableStats.length > 0 && "IntersectionObserver" in window) {
  const statsObserver = new IntersectionObserver(
    (entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;

      startStatsCounter();
      observer.disconnect();
    },
    { threshold: 0.3 }
  );

  statsObserver.observe(statsSection);
} else {
  startStatsCounter();
}

const partnerMarquees = document.querySelectorAll("[data-partner-marquee]");

partnerMarquees.forEach((marquee) => {
  const track = marquee.querySelector(".partner-track");
  const group = marquee.querySelector(".partner-group");

  if (!track || !group) return;

  if (!prefersReducedMotion) {
    const clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((image) => image.setAttribute("alt", ""));
    track.appendChild(clone);
  }

  const speed = Number(marquee.dataset.speed) || 38;
  let groupWidth = 0;
  let position = 0;
  let previousTime = performance.now();

  const measure = () => {
    const previousWidth = groupWidth;
    groupWidth = group.getBoundingClientRect().width;

    if (previousWidth > 0) {
      position = (position / previousWidth) * groupWidth;
    } else {
      position = -groupWidth;
    }
  };

  const animate = (currentTime) => {
    const elapsed = Math.min(currentTime - previousTime, 50);
    previousTime = currentTime;
    position += (speed * elapsed) / 1000;

    if (position >= 0) {
      position -= groupWidth;
    }

    track.style.transform = `translate3d(${position}px, 0, 0)`;
    requestAnimationFrame(animate);
  };

  measure();

  if (!prefersReducedMotion) {
    previousTime = performance.now();
    requestAnimationFrame(animate);
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(marquee);
  } else {
    window.addEventListener("resize", measure);
  }

  document.addEventListener("visibilitychange", () => {
    previousTime = performance.now();
  });
});
