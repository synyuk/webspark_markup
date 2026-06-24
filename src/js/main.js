import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

// Create post
import events from '../data/events.json';

const heartIcon = '<svg class="post__icon" width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.95536e-08 4.05069C-9.22365e-05 3.51247 0.107097 2.97963 0.315302 2.48331C0.523508 1.98698 0.828553 1.53714 1.21261 1.16007C1.59667 0.782992 2.05203 0.486251 2.55209 0.287187C3.05215 0.0881223 3.58687 -0.00927256 4.125 0.000694555C4.76172 -0.00268682 5.39189 0.129297 5.97374 0.387898C6.55559 0.646498 7.07584 1.02581 7.5 1.50069C7.92416 1.02581 8.44441 0.646498 9.02626 0.387898C9.60811 0.129297 10.2383 -0.00268682 10.875 0.000694555C11.4131 -0.00927256 11.9479 0.0881223 12.4479 0.287187C12.948 0.486251 13.4033 0.782992 13.7874 1.16007C14.1714 1.53714 14.4765 1.98698 14.6847 2.48331C14.8929 2.97963 15.0001 3.51247 15 4.05069C15 8.06769 10.2157 11.1007 7.5 13.5007C4.79025 11.0804 5.95536e-08 8.07069 5.95536e-08 4.05069Z" fill="black"/></svg>';
const commentIcon = '<svg class="post__icon" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 1.5C15 0.675 14.325 0 13.5 0H1.5C0.675 0 0 0.675 0 1.5V10.5C0 11.325 0.675 12 1.5 12H12L15 15V1.5Z" fill="black"/></svg>';

function createPostHTML(event) {
    const hiddenClass = event.hidden ? ' post--hidden' : '';
    return `<article class="post${hiddenClass}" data-date="${event.date}" data-initially-hidden="${!!event.hidden}">
                    <div class="post__image">
                        <img src="${event.image}" alt="Post image" loading="lazy">
                    </div>
                    <div class="post__content">
                        <div class="post__group post__group--left">
                            <span class="post__label">${event.label}</span>
                            <div class="post__group-stats">
                                <span class="post__stat">${heartIcon} ${event.likes}</span>
                                <span class="post__stat">${commentIcon} ${event.comments}</span>
                            </div>
                        </div>
                        <div class="post__group post__group--center">
                            <span class="post__date">${event.date}</span>
                            <div class="post__group-stats">
                                <span class="post__stat">${heartIcon} ${event.centerLikes}</span>
                                <span class="post__stat">${commentIcon} ${event.centerComments}</span>
                            </div>
                        </div>
                        <div class="post__group post__group--right">
                            <span class="post__label">${event.rightLabel}</span>
                            <span class="post__date post__date--small">${event.rightDate}</span>
                        </div>
                    </div>
                </article>`;
}

// Render posts
const postsContainer = document.getElementById('postsContainer');
postsContainer.innerHTML = events.map(createPostHTML).join('\n');

// Fixed header
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    let windowWidth = window.outerWidth;
    let width;
    windowWidth > 768 ? width=100 : width=300;
    if (window.scrollY > 300) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Date pickers
const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');

function parseDate(str) {
    const [d, m, y] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

function filterPosts() {
    const posts = document.querySelectorAll('.post');
    const noPosts = document.querySelector('.no-posts');
    const fromVal = dateFromInput.value;
    const toVal = dateToInput.value;
    const fromDate = fromVal ? parseDate(fromVal) : null;
    const toDate = toVal ? parseDate(toVal) : null;

    let visibleCount = 0;

    const isFiltering = !!fromDate;

    posts.forEach((post) => {
        const postDateStr = post.dataset.date;
        if (!postDateStr) return;

        const postDate = parseDate(postDateStr);
        let show = true;

        if (fromDate && postDate < fromDate) show = false;
        if (toDate && postDate > toDate) show = false;

        if (show) {
            post.classList.remove('post--filtered');
            if (isFiltering) {
                post.classList.remove('post--hidden');
            } else if (post.dataset.initiallyHidden === 'true') {
                post.classList.add('post--hidden');
            }
            visibleCount++;
        } else {
            post.classList.add('post--filtered');
        }
    });

    if (visibleCount === 0) {
        noPosts.classList.remove('hidden');
    } else {
        noPosts.classList.add('hidden');
    }

    // Hide load more when filtering or no hidden posts left
    const hiddenByLoadMore = document.querySelectorAll('.post--hidden:not(.post--filtered)');
    loadMoreWrap.style.display = (isFiltering || hiddenByLoadMore.length === 0) ? 'none' : '';
}

const flatpickrConfig = {
    dateFormat: 'd-m-Y',
    allowInput: false,
    onChange: filterPosts,
};

const fpFrom = flatpickr(dateFromInput, flatpickrConfig);
const fpTo = flatpickr(dateToInput, {
    ...flatpickrConfig,
    defaultDate: new Date(),
});

// Clear & calendar buttons
document.querySelectorAll('.header__date-input').forEach((wrapper) => {
    const input = wrapper.querySelector('.date-picker');
    const clearBtn = wrapper.querySelector('.date-clear');
    const calendarBtn = wrapper.querySelector('.date-calendar');

    clearBtn.addEventListener('click', () => {
        const fp = input._flatpickr;
        if (fp) {
            fp.clear();
            filterPosts();
        }
    });

    calendarBtn.addEventListener('click', () => {
        const fp = input._flatpickr;
        if (fp) fp.open();
    });
});

// Load More
const loadMoreBtn = document.querySelector('.load-more__btn');
const loadMoreWrap = document.querySelector('.load-more');
const POSTS_PER_PAGE = 4;

// Apply initial filter (dateTo has defaultDate)
filterPosts();

loadMoreBtn.addEventListener('click', () => {
    const hiddenPosts = document.querySelectorAll('.post--hidden:not(.post--filtered)');
    const toShow = Array.from(hiddenPosts).slice(0, POSTS_PER_PAGE);

    toShow.forEach((post, i) => {
        setTimeout(() => {
            post.classList.remove('post--hidden');
            post.classList.add('post--revealing');
            post.addEventListener('animationend', () => {
                post.classList.remove('post--revealing');
            }, { once: true });
        }, i * 100);
    });

    if (hiddenPosts.length <= POSTS_PER_PAGE) {
        loadMoreWrap.style.display = 'none';
    }
});

// View toggle
const toggleBtns = document.querySelectorAll('.view-toggle__btn');

toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        toggleBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        postsContainer.classList.remove('posts--tiles', 'posts--rows');
        postsContainer.classList.add(`posts--${view}`);
    });
});