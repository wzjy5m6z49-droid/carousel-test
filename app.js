const config = window.carouselConfig || {};

const ARROW_COLOR =
  config.arrowColor || "#ffffff";

const DOT_COLOR =
  config.dotColor || "#94a3b8";

const DOT_ACTIVE_COLOR =
  config.dotActiveColor || "#ffffff";

const GLASS_STRENGTH =
  Number(config.glassStrength || 16);

const SHADOW_STRENGTH =
  Number(config.shadowStrength || 28);

const SHOW_DETAIL_BUTTON =
  config.showDetailButton !== false;

const ENTRANCE_ANIMATION =
  config.entranceAnimation || "fadeUp";

const DOT_POSITION =
  config.dotPosition || "overlay";

const BUTTON_BACKGROUND_COLOR =
  config.buttonBackgroundColor || "#ffffff";

const BUTTON_TEXT_COLOR =
  config.buttonTextColor || "#333333";

const ARROW_POSITION =
  config.arrowPosition || "inside";

const shell = document.querySelector(".carouselShell");

const root =
  document.querySelector(".carouselRoot");

root.classList.add(
  `entrance-${ENTRANCE_ANIMATION}`
);

const slider = document.getElementById("slider");
const dots = document.getElementById("dots");
const dotsWrap = document.getElementById("dotsWrap");
const carousel = document.getElementById("carousel");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

if(ARROW_POSITION === "outside"){
  shell.classList.add("outside");
}else{
  shell.classList.add("inside");
}

if(ARROW_POSITION === "inside"){
  carousel.appendChild(prevButton);
  carousel.appendChild(nextButton);
  carousel.classList.add("arrowsInside");
}else{
  shell.insertBefore(prevButton, carousel);
  shell.appendChild(nextButton);
  carousel.classList.remove("arrowsInside");
}

if(DOT_POSITION === "overlay"){
  carousel.appendChild(dots);
  carousel.classList.add("dotsOverlay");
}else{
  dotsWrap.appendChild(dots);
  carousel.classList.remove("dotsOverlay");
}

const rawItems = window.carouselData || [];
const holidays = (window.holidayData || [])
  .map(x => x.HolidayDate)
  .filter(Boolean);

const SLIDE_INTERVAL =
  Number(config.slideInterval || 3000);

const TRANSITION_DURATION =
  Number(config.transitionDuration || 650);

const CAROUSEL_LAYOUT =
  config.carouselLayout || "normal";

const AUTO_PLAY =
  config.autoPlay !== false;

const PAUSE_ON_HOVER =
  config.pauseOnHover !== false;

const SHOW_DOTS =
  config.showDots !== false;

const SHOW_ARROWS =
  config.showArrows !== false;

const IMAGE_FIT =
  config.imageFit || "contain";

const MAX_WIDTH =
  Number(config.maxWidth || 980);

const BORDER_RADIUS =
  Number(config.borderRadius || 18);

const DETAIL_BUTTON_TEXT =
  config.detailButtonText || "詳しく見る";

const SORT_ORDER =
  config.sortOrder || "更新日の新しい順";

let current = 0;
let timer = null;

carousel.classList.add(
  CAROUSEL_LAYOUT === "peek"
    ? "layoutPeek"
    : "layoutNormal"
);

carousel.style.maxWidth =
  `${MAX_WIDTH}px`;

carousel.style.borderRadius =
  `${BORDER_RADIUS}px`;

carousel.style.setProperty(
  "--slide-interval",
  `${SLIDE_INTERVAL}ms`
);

slider.style.transition =
  `transform ${TRANSITION_DURATION}ms cubic-bezier(.22,.8,.2,1)`;


prevButton.innerHTML = `
  <svg class="arrowSvg" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M15 4 L7 12 L15 20"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

nextButton.innerHTML = `
  <svg class="arrowSvg" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M9 4 L17 12 L9 20"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;


if(!SHOW_ARROWS){
  prevButton.style.display = "none";
  nextButton.style.display = "none";
}

if(!SHOW_DOTS){
  dots.style.display = "none";
}

prevButton.style.color = ARROW_COLOR;
nextButton.style.color = ARROW_COLOR;

document.documentElement.style.setProperty(
  "--dot-color",
  DOT_COLOR
);

document.documentElement.style.setProperty(
  "--dot-active-color",
  DOT_ACTIVE_COLOR
);

document.documentElement.style.setProperty(
  "--glass-strength",
  `${GLASS_STRENGTH}px`
);

document.documentElement.style.setProperty(
  "--shadow-strength",
  SHADOW_STRENGTH
);

document.documentElement.style.setProperty(
  "--button-bg",
  BUTTON_BACKGROUND_COLOR
);

document.documentElement.style.setProperty(
  "--button-color",
  BUTTON_TEXT_COLOR
);

const now = new Date();

const today = new Date();
today.setHours(0, 0, 0, 0);


function formatDateKey(date){
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}


const todayKey =
  formatDateKey(today);

const isHolidayToday =
  holidays.includes(todayKey);


function parseDate(value){
  if(!value){
    return null;
  }

  const d = new Date(value);
  d.setHours(0, 0, 0, 0);

  return d;
}


function getTodayKey(){
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
}


function getDisplayDays(item){
  if(!Array.isArray(item.DisplayDays)){
    return [];
  }

  return item.DisplayDays
    .map(day => day && day.Value)
    .filter(Boolean);
}


function normalizeTime(value){
  if(!value){
    return "";
  }

  const parts = String(value).split(":");

  if(parts.length < 2){
    return "";
  }

  return `${String(parts[0]).padStart(2, "0")}:${String(parts[1]).padStart(2, "0")}`;
}


function isSameDate(a, b){
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


function getMonthlyDisplayDate(item){
  const baseDay =
    Number(item.BaseDay || 0);

  if(!baseDay){
    return null;
  }

  const target =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      baseDay
    );

  target.setHours(0, 0, 0, 0);

  if(item.ShiftToFriday === true){
    while(
      target.getDay() === 0 ||
      target.getDay() === 6 ||
      holidays.includes(formatDateKey(target))
    ){
      target.setDate(target.getDate() - 1);
    }
  }

  return target;
}


function isAllowedBaseDay(item){
  if(!item.BaseDay){
    return true;
  }

  const displayDate =
    getMonthlyDisplayDate(item);

  if(!displayDate){
    return true;
  }

  return isSameDate(today, displayDate);
}


function isAllowedHoliday(item){
  if(item.HolidayMode === "holiday"){
    return isHolidayToday;
  }

  if(item.HolidayMode === "nonHoliday"){
    return !isHolidayToday;
  }

  return true;
}


function isAllowedTime(item){
  const start =
    normalizeTime(item.ShowStartTime);

  const end =
    normalizeTime(item.ShowEndTime);

  if(!start && !end){
    return true;
  }

  const currentTime =
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if(start && currentTime < start){
    return false;
  }

  if(end && currentTime > end){
    return false;
  }

  return true;
}


function isAllowedDay(item){
  const days =
    getDisplayDays(item);

  if(!days.length){
    return true;
  }

  return days.includes(getTodayKey());
}


function isAllowedDate(item){
  const start =
    parseDate(item.StartDate);

  const end =
    parseDate(item.EndDate);

  if(start && today < start){
    return false;
  }

  if(end && today > end){
    return false;
  }

  return true;
}


const items = rawItems
  .filter(item => {
    if(!item || !item.Image){
      return false;
    }

    if(!isAllowedDate(item)){
      return false;
    }

    if(!isAllowedBaseDay(item)){
      return false;
    }

    if(!isAllowedHoliday(item)){
      return false;
    }

    if(!isAllowedDay(item)){
      return false;
    }

    if(!isAllowedTime(item)){
      return false;
    }

    return true;
  })
  .sort((a, b) => {

    const priorityMap = {
  "最優先": 1,
  "通常": 2
};

const priorityDiff =
  (priorityMap[a.Priority] || 99) -
  (priorityMap[b.Priority] || 99);

if(priorityDiff !== 0){
  return priorityDiff;
}

if(SORT_ORDER === "更新日の古い順"){
  return (
    new Date(a.Modified || 0) -
    new Date(b.Modified || 0)
  );
}

return (
  new Date(b.Modified || 0) -
  new Date(a.Modified || 0)
);

});


function render(){
  if(!items.length){
    slider.innerHTML =
      '<div class="empty">表示対象の画像がありません</div>';

    return;
  }

  slider.innerHTML = "";
  dots.innerHTML = "";

  items.forEach((item, index) => {
    const slide =
      document.createElement("div");

    slide.className = "slide";

    if(item.Link && !SHOW_DETAIL_BUTTON){
      slide.innerHTML = `
        <a href="${item.Link}" target="_top" class="slideLink">
          <img src="${item.Image}" alt="" style="object-fit:${IMAGE_FIT};">
        </a>
      `;
    }
    else{
      slide.innerHTML = `
        <img src="${item.Image}" alt="" style="object-fit:${IMAGE_FIT};">

        ${
          item.Link && SHOW_DETAIL_BUTTON
            ? `<a class="detailButton" href="${item.Link}" target="_top">${DETAIL_BUTTON_TEXT}</a>`
            : ""
        }
      `;
    }

    slider.appendChild(slide);

    const dot =
      document.createElement("span");

    dot.className =
      "dot" + (index === current ? " active" : "");

    dot.innerHTML =
      '<span class="progressFill"></span>';

    const progressFill =
  dot.querySelector(".progressFill");

progressFill.addEventListener(
  "animationend",
  () => {

    if(index !== current){
      return;
    }

    next();
    restart();

  }
);

    dot.onclick = () => {
      current = index;
      update();
      restart();
    };

    dots.appendChild(dot);
  });

  update();
  restart();
}

function update(){
  if(CAROUSEL_LAYOUT === "peek"){
    slider.style.transform =
      `translateX(calc(10% - ${current * 100}%))`;
  }
  else{
    slider.style.transform =
      `translateX(-${current * 100}%)`;
  }

  Array
    .from(dots.children)
    .forEach((dot, index) => {
      dot.classList.remove("active");

      if(index === current){
        void dot.offsetWidth;
        dot.classList.add("active");
      }
    });

  Array
    .from(slider.children)
    .forEach((slide, index) => {
      if(CAROUSEL_LAYOUT !== "peek"){
        return;
      }

      if(index === current){
        slide.classList.add("activeSlide");
      }
      else{
        slide.classList.remove("activeSlide");
      }
    });
}


function next(){
  if(!items.length){
    return;
  }

  current =
    (current + 1) % items.length;

  update();
}


function prev(){
  if(!items.length){
    return;
  }

  current =
    current === 0
      ? items.length - 1
      : current - 1;

  update();
}


function restart(){
  if(timer){
    clearInterval(timer);
  }

  Array
    .from(dots.children)
    .forEach((dot, index) => {
      dot.classList.remove("active");

      if(index === current){
        void dot.offsetWidth;
        dot.classList.add("active");
      }
    });

  Array
    .from(dots.children)
    .forEach(dot => {

      const fill =
        dot.querySelector(".progressFill");

      if(!fill){
        return;
      }

      fill.style.animation = "none";

      void fill.offsetWidth;

      fill.style.animation = "";

    });

  if(!AUTO_PLAY){
    return;
  }

  if(items.length <= 1){
    return;
  }

}


nextButton.onclick = () => {
  next();
  restart();
};


prevButton.onclick = () => {
  prev();
  restart();
};


carousel.addEventListener("mouseenter", () => {
  if(!PAUSE_ON_HOVER){
    return;
  }

  root.classList.add("paused");
});

carousel.addEventListener("mouseleave", () => {
  if(!PAUSE_ON_HOVER){
    return;
  }

  root.classList.remove("paused");
});

render();carousel
