/* =========================================
   SKY LAB DIAMONDS - site interactions
========================================= */

/* -------------------------
   1. DIAMOND SHAPE EXPLORER
-------------------------- */

const SHAPES = {
    round: {
        name: "Round",
        desc: "The classic brilliant cut, faceted for maximum sparkle. The most requested shape for solitaires and stud earrings.",
        character: "Brilliant, timeless",
        uses: "Solitaires, studs, eternity rings"
    },
    oval: {
        name: "Oval",
        desc: "An elongated brilliant cut that keeps strong sparkle and can look larger than a round of the same carat weight.",
        character: "Elegant, elongating",
        uses: "Engagement rings, pendants"
    },
    emerald: {
        name: "Emerald",
        desc: "A step cut with long, rectangular facets that create a calm ‘hall of mirrors’ effect rather than scattered sparkle.",
        character: "Clean, understated",
        uses: "Statement rings, three-stone designs"
    },
    pear: {
        name: "Pear",
        desc: "A teardrop shape that combines the round and marquise cuts, with one rounded end and one point.",
        character: "Graceful, distinctive",
        uses: "Pendants, drop earrings, rings"
    },
    princess: {
        name: "Princess",
        desc: "A square brilliant cut with sharp corners, combining a modern outline with strong sparkle.",
        character: "Modern, crisp",
        uses: "Solitaires, channel-set bands"
    },
    radiant: {
        name: "Radiant",
        desc: "A rectangular or square cut with trimmed corners and brilliant faceting, giving sparkle with a structured outline.",
        character: "Lively, contemporary",
        uses: "Engagement rings, side stones"
    },
    marquise: {
        name: "Marquise",
        desc: "A long, boat-shaped brilliant cut with pointed ends that makes the most of the stone\u2019s visible size.",
        character: "Bold, vintage-inspired",
        uses: "Rings, cluster and halo designs"
    },
    heart: {
        name: "Heart",
        desc: "A brilliant-cut heart. Good symmetry between the two lobes is key to a well-defined shape.",
        character: "Romantic, expressive",
        uses: "Pendants, gift pieces, rings"
    },
    cushion: {
        name: "Cushion",
        desc: "A square or slightly rectangular cut with softly rounded corners and large facets, giving a vintage-inspired look.",
        character: "Soft, vintage-inspired",
        uses: "Engagement rings, halo designs"
    },
    trillion: {
        name: "Trillion",
        desc: "A triangular brilliant cut with bold, clean lines \u2014 striking as a centre stone or as side stones beside a larger diamond.",
        character: "Bold, geometric",
        uses: "Side stones, statement rings, pendants"
    }
};

const explorer = document.getElementById("shape-explorer");

if (explorer) {
    const keys = Object.keys(SHAPES);
    const buttons = explorer.querySelectorAll(".shape-option");
    const img = document.getElementById("shape-image");
    const info = explorer.querySelector(".shape-info");
    const enquire = document.getElementById("shape-enquire");
    let current = 0;
    let timer = null;

    // preload all shape photos so switching is instant
    keys.forEach((key) => {
        const pre = new Image();
        pre.src = `images/diamonds/${key}.webp`;
    });

    function showShape(index, moveFocus = false) {
        current = (index + keys.length) % keys.length;
        const key = keys[current];
        const shape = SHAPES[key];

        buttons.forEach((btn, i) => {
            const active = i === current;
            btn.classList.toggle("is-active", active);
            btn.setAttribute("aria-selected", active);
            btn.tabIndex = active ? 0 : -1;
        });
        if (moveFocus) buttons[current].focus();

        img.classList.add("is-changing");
        info.classList.add("is-changing");
        clearTimeout(timer);

        timer = setTimeout(() => {
            img.src = `images/diamonds/${key}.webp`;
            img.alt = `${shape.name} lab-grown diamond (3D illustration)`;
            document.getElementById("shape-count").textContent =
                `${String(current + 1).padStart(2, "0")} / ${String(keys.length).padStart(2, "0")}`;
            document.getElementById("shape-name").textContent = shape.name;
            document.getElementById("shape-desc").textContent = shape.desc;
            document.getElementById("shape-character").textContent = shape.character;
            document.getElementById("shape-uses").textContent = shape.uses;
            enquire.textContent = `Request ${shape.name} Price`;
            enquire.dataset.enquiryItem = `${shape.name} lab-grown diamond`;

            img.classList.remove("is-changing");
            info.classList.remove("is-changing");
        }, 300);
    }

    buttons.forEach((btn, i) => {
        btn.addEventListener("click", () => showShape(i));
    });

    explorer.querySelector(".shape-arrow-prev").addEventListener("click", () => showShape(current - 1));
    explorer.querySelector(".shape-arrow-next").addEventListener("click", () => showShape(current + 1));

    // keyboard: left/right arrows move between shapes
    explorer.querySelector(".shape-picker").addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); showShape(current + 1, true); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); showShape(current - 1, true); }
    });

    // touch: swipe the big diamond on phones
    let startX = null;
    const stage = explorer.querySelector(".shape-stage");
    stage.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
        if (startX === null) return;
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 40) showShape(current + (diff < 0 ? 1 : -1));
        startX = null;
    });
}


/* -------------------------
   2. "REQUEST PRICE" PRE-FILLS THE FORM
-------------------------- */

const form = document.getElementById("trade-enquiry-form");

document.querySelectorAll("[data-enquiry-item]").forEach((link) => {
    link.addEventListener("click", () => {
        if (!form) return;

        const select = document.getElementById("enquiry-type");
        const message = document.getElementById("message");

        if (link.dataset.enquiryType) select.value = link.dataset.enquiryType;

        const line = `I'm interested in: ${link.dataset.enquiryItem}`;
        const existing = message.value.trim();

        if (!existing) {
            message.value = `${line}\n\nQuantity / specifications: `;
        } else if (existing.startsWith("I'm interested in:")) {
            // replace the previous selection instead of stacking lines
            message.value = existing.replace(/^I'm interested in:.*$/m, line);
        } else {
            message.value = `${line}\n\n${existing}`;
        }

        form.classList.add("is-prefilled");
        setTimeout(() => form.classList.remove("is-prefilled"), 2500);
    });
});


/* -------------------------
   3. SEND THE FORM WITHOUT LEAVING THE PAGE
-------------------------- */

if (form) {
    const submitBtn = document.getElementById("enquiry-submit");
    const errorBox = document.getElementById("form-error");
    const successBox = document.getElementById("form-success");
    const resetBtn = document.getElementById("form-reset");
    const originalLabel = submitBtn.textContent.trim();

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // stop the browser going to Formspree's page

        errorBox.hidden = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error(`Formspree returned ${response.status}`);

            form.reset();
            form.hidden = true;
            successBox.hidden = false;
            successBox.focus();
        } catch (err) {
            console.error("Enquiry failed:", err);
            errorBox.hidden = false;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
        }
    });

    resetBtn.addEventListener("click", () => {
        successBox.hidden = true;
        form.hidden = false;
        document.getElementById("name").focus();
    });
}


/* -------------------------
   4. MOBILE MENU
-------------------------- */

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("nav-links");

if (navToggle && navLinks) {
    function setMenu(open) {
        navLinks.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open);
        navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    navToggle.addEventListener("click", () => {
        setMenu(!navLinks.classList.contains("is-open"));
    });

    // close after choosing a link
    navLinks.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => setMenu(false));
    });

    // close with the Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
            setMenu(false);
            navToggle.focus();
        }
    });

    // close when tapping outside the menu
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".navbar")) setMenu(false);
    });
}



/* -------------------------
   5. LIGHT / DARK THEME TOGGLE
-------------------------- */

const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
    const root = document.documentElement;

    function updateToggle() {
        const dark = root.getAttribute("data-theme") === "champagne-dark";
        themeToggle.setAttribute("aria-pressed", dark);
        themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }

    themeToggle.addEventListener("click", () => {
        const dark = root.getAttribute("data-theme") !== "champagne-dark";
        root.setAttribute("data-theme", dark ? "champagne-dark" : "champagne");
        try { localStorage.setItem("skylab-theme", dark ? "dark" : "light"); } catch (e) {}
        updateToggle();
    });

    updateToggle();
}


/* -------------------------
   6. JEWELLERY GALLERY
-------------------------- */

const GALLERIES = {
    rings:     { title: "Rings",                  item: "Lab-grown diamond rings",                  type: "jewellery" },
    earrings:  { title: "Earrings",               item: "Lab-grown diamond earrings",               type: "jewellery" },
    necklaces: { title: "Necklaces & Pendants",   item: "Lab-grown diamond necklaces & pendants",   type: "jewellery" },
    bracelets: { title: "Bracelets",              item: "Lab-grown diamond bracelets",              type: "jewellery" },
    bangles:   { title: "Bangles",                item: "Lab-grown diamond bangles",                type: "jewellery" },
    bespoke:   { title: "Bespoke Jewellery",      item: "Bespoke jewellery",                        type: "bespoke"   }
};

// photo list for each category: the main card photo first, then 5 gallery photos
function galleryPhotos(slug) {
    const photos = [{ full: `images/jewellery/${slug}.jpg`, thumb: `images/jewellery/gallery/${slug}-0-thumb.webp` }];
    for (let n = 1; n <= 5; n++) {
        photos.push({
            full: `images/jewellery/gallery/${slug}-${n}.webp`,
            thumb: `images/jewellery/gallery/${slug}-${n}-thumb.webp`
        });
    }
    return photos;
}

const gallery = document.getElementById("gallery");

if (gallery) {
    const gImg = document.getElementById("gallery-image");
    const gTitle = document.getElementById("gallery-title");
    const gCount = document.getElementById("gallery-count");
    const gThumbs = document.getElementById("gallery-thumbs");
    const gEnquire = document.getElementById("gallery-enquire");
    let photos = [];
    let index = 0;
    let current = null;
    let opener = null;

    function showPhoto(i) {
        index = (i + photos.length) % photos.length;
        gImg.classList.add("is-loading");
        gImg.onload = () => gImg.classList.remove("is-loading");
        gImg.src = photos[index].full;
        gImg.alt = `${current.title}: photo ${index + 1} of ${photos.length}`;
        gCount.textContent = `${index + 1} / ${photos.length}`;
        gThumbs.querySelectorAll("button").forEach((b, k) => {
            b.setAttribute("aria-current", k === index ? "true" : "false");
        });
        // preload the next photo
        new Image().src = photos[(index + 1) % photos.length].full;
    }

    function openGallery(slug, button) {
        current = GALLERIES[slug];
        if (!current) return;
        opener = button;
        photos = galleryPhotos(slug);

        gTitle.textContent = current.title;
        gEnquire.textContent = `Request ${current.title} Price`;
        gEnquire.dataset.enquiryItem = current.item;
        gEnquire.dataset.enquiryType = current.type;

        gThumbs.innerHTML = "";
        photos.forEach((p, k) => {
            const b = document.createElement("button");
            b.type = "button";
            b.setAttribute("aria-label", `Show photo ${k + 1}`);
            b.innerHTML = `<img src="${p.thumb}" alt="" loading="lazy">`;
            b.addEventListener("click", () => showPhoto(k));
            gThumbs.appendChild(b);
        });

        gallery.hidden = false;
        document.body.classList.add("gallery-is-open");
        showPhoto(0);
        gallery.querySelector(".gallery-close").focus();
    }

    function closeGallery() {
        gallery.hidden = true;
        document.body.classList.remove("gallery-is-open");
        if (opener) opener.focus({ preventScroll: true });
    }

    document.querySelectorAll(".gallery-open").forEach((btn) => {
        btn.addEventListener("click", () => openGallery(btn.dataset.gallery, btn));
    });

    gallery.querySelectorAll("[data-gallery-close]").forEach((el) => el.addEventListener("click", closeGallery));
    gallery.querySelector(".gallery-prev").addEventListener("click", () => showPhoto(index - 1));
    gallery.querySelector(".gallery-next").addEventListener("click", () => showPhoto(index + 1));

    // "Request price" closes the gallery; the form pre-fill (section 2) also runs
    gEnquire.addEventListener("click", () => {
        gallery.hidden = true;
        document.body.classList.remove("gallery-is-open");
    });

    document.addEventListener("keydown", (e) => {
        if (gallery.hidden) return;
        if (e.key === "Escape") closeGallery();
        if (e.key === "ArrowRight") showPhoto(index + 1);
        if (e.key === "ArrowLeft") showPhoto(index - 1);
        // keep keyboard focus inside the gallery
        if (e.key === "Tab") {
            const f = [...gallery.querySelectorAll("button, a[href]")].filter((el) => el.offsetParent !== null);
            if (!f.length) return;
            if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
    });

    // swipe on phones
    let sx = null;
    const main = gallery.querySelector(".gallery-main");
    main.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    main.addEventListener("touchend", (e) => {
        if (sx === null) return;
        const d = e.changedTouches[0].clientX - sx;
        if (Math.abs(d) > 40) showPhoto(index + (d < 0 ? 1 : -1));
        sx = null;
    });
}
