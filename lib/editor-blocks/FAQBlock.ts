export interface FAQData {
  question: string;
  answer: string;
  open?: boolean;
}

export default class FAQBlock {
  private data: FAQData;
  private wrapper: HTMLElement | null = null;
  private questionEl: HTMLElement | null = null;
  private answerEl: HTMLElement | null = null;
  private bodyEl: HTMLElement | null = null;
  private toggleBtn: HTMLButtonElement | null = null;
  private chevronEl: HTMLElement | null = null;
  private isOpen: boolean = true;

  static get toolbox() {
    return {
      title: "FAQ / سؤال وجواب",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
    };
  }

  static get enableLineBreaks() {
    return true;
  }

  constructor({ data }: { data: Partial<FAQData> }) {
    this.data = {
      question: data?.question || "",
      answer: data?.answer || "",
      open: data?.open !== false,
    };
    this.isOpen = this.data.open !== false;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("faq-block");
    this.wrapper.style.cssText = `
      border: 1px solid #3a3a3a;
      border-radius: 10px;
      overflow: hidden;
      background: #1e1e1e;
      margin: 8px 0;
      transition: border-color 0.2s ease;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: #252525;
      border-bottom: 1px solid #3a3a3a;
      direction: rtl;
    `;

    const icon = document.createElement("span");
    icon.textContent = "❓";
    icon.style.fontSize = "16px";

    const label = document.createElement("span");
    label.textContent = "سؤال وجواب";
    label.style.cssText = `
      flex: 1;
      font-size: 11px;
      font-weight: 600;
      color: #34cc30;
      font-family: var(--font-tajawal, Tahoma, sans-serif);
    `;

    this.toggleBtn = document.createElement("button");
    this.toggleBtn.type = "button";
    this.toggleBtn.setAttribute("aria-label", "طي/فتح");
    this.toggleBtn.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #b0b0b0;
      cursor: pointer;
      transition: background 0.15s ease;
    `;
    this.toggleBtn.addEventListener("mouseenter", () => {
      if (this.toggleBtn) this.toggleBtn.style.background = "#333";
    });
    this.toggleBtn.addEventListener("mouseleave", () => {
      if (this.toggleBtn) this.toggleBtn.style.background = "transparent";
    });

    this.chevronEl = document.createElement("span");
    this.chevronEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    this.chevronEl.style.cssText = `
      display: inline-flex;
      transition: transform 0.25s ease;
      transform: rotate(${this.isOpen ? 0 : -90}deg);
    `;
    this.toggleBtn.appendChild(this.chevronEl);

    this.toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    header.appendChild(icon);
    header.appendChild(label);
    header.appendChild(this.toggleBtn);

    this.bodyEl = document.createElement("div");
    this.bodyEl.style.cssText = `
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: ${this.isOpen ? "1000px" : "0px"};
      opacity: ${this.isOpen ? "1" : "0"};
      padding-top: ${this.isOpen ? "14px" : "0"};
      padding-bottom: ${this.isOpen ? "14px" : "0"};
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.2s ease, padding 0.25s ease;
    `;

    this.questionEl = document.createElement("div");
    this.questionEl.contentEditable = "true";
    this.questionEl.dataset.placeholder = "السؤال...";
    this.questionEl.textContent = this.data.question;
    this.questionEl.style.cssText = `
      font-size: 15px;
      font-weight: 700;
      color: #e0e0e0;
      outline: none;
      border: none;
      background: transparent;
      direction: rtl;
      text-align: right;
      font-family: var(--font-tajawal, Tahoma, sans-serif);
      min-height: 24px;
    `;
    this.questionEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.answerEl?.focus();
      }
    });

    const separator = document.createElement("div");
    separator.style.cssText = `
      height: 1px;
      background: #3a3a3a;
    `;

    this.answerEl = document.createElement("div");
    this.answerEl.contentEditable = "true";
    this.answerEl.dataset.placeholder = "الجواب...";
    this.answerEl.textContent = this.data.answer;
    this.answerEl.style.cssText = `
      font-size: 14px;
      color: #b0b0b0;
      outline: none;
      border: none;
      background: transparent;
      direction: rtl;
      text-align: right;
      font-family: var(--font-tajawal, Tahoma, sans-serif);
      min-height: 48px;
      line-height: 1.7;
    `;

    this.addPlaceholderBehavior(this.questionEl);
    this.addPlaceholderBehavior(this.answerEl);

    this.bodyEl.appendChild(this.questionEl);
    this.bodyEl.appendChild(separator);
    this.bodyEl.appendChild(this.answerEl);

    this.wrapper.appendChild(header);
    this.wrapper.appendChild(this.bodyEl);

    return this.wrapper;
  }

  private toggle() {
    this.isOpen = !this.isOpen;
    if (this.bodyEl) {
      this.bodyEl.style.maxHeight = this.isOpen ? "1000px" : "0px";
      this.bodyEl.style.opacity = this.isOpen ? "1" : "0";
      this.bodyEl.style.paddingTop = this.isOpen ? "14px" : "0";
      this.bodyEl.style.paddingBottom = this.isOpen ? "14px" : "0";
    }
    if (this.chevronEl) {
      this.chevronEl.style.transform = `rotate(${this.isOpen ? 0 : -90}deg)`;
    }
  }

  private addPlaceholderBehavior(el: HTMLElement) {
    const placeholder = el.dataset.placeholder || "";
    if (!el.textContent) {
      el.style.color = "#666";
      el.textContent = placeholder;
    }
    el.addEventListener("focus", () => {
      if (el.textContent === placeholder) {
        el.textContent = "";
        el.style.color = el === this.questionEl ? "#e0e0e0" : "#b0b0b0";
      }
    });
    el.addEventListener("blur", () => {
      if (!el.textContent?.trim()) {
        el.style.color = "#666";
        el.textContent = placeholder;
      }
    });
  }

  save() {
    const questionPlaceholder = this.questionEl?.dataset.placeholder || "";
    const answerPlaceholder = this.answerEl?.dataset.placeholder || "";
    const question = this.questionEl?.textContent?.trim() || "";
    const answer = this.answerEl?.textContent?.trim() || "";
    return {
      question: question === questionPlaceholder ? "" : question,
      answer: answer === answerPlaceholder ? "" : answer,
      open: this.isOpen,
    };
  }

  validate(data: FAQData) {
    return !!data.question?.trim();
  }

  static get sanitize() {
    return {
      question: {},
      answer: {},
      open: false,
    };
  }
}
