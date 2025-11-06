// Map section -> nav link
const sections = document.querySelectorAll("main section");
const navLinks = document.querySelectorAll("nav a");

// helper: clear current
function clearActive() {
  navLinks.forEach(a => a.classList.remove("active"));
}

// observer: watches which section is in view
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      clearActive();
      const link = document.querySelector(`nav a[href="#${id}"]`);
      if (link) link.classList.add("active");
    }
  });
}, {
  root: null,
  threshold: 0.6,            // section must be 60% visible
  rootMargin: "-120px 0px -35% 0px" // offset for sticky header height
});

window.addEventListener('scroll', () => {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
  if (nearBottom) {
    clearActive();
    const last = document.querySelector('nav a[href="#TREACHERY"]'); // use your exact ID
    if (last) last.classList.add('active');
  }
});


// start observing
sections.forEach(sec => observer.observe(sec));
