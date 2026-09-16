(() => {
  'use strict';
  const config = window.MEMORY_CONFIG || {};
  const byId = id => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let toastTimer;
  const photos = Array.isArray(config.photos) ? config.photos : [];
  const duration = Math.max(22, Number(config.animationDuration) || 56);
  const dialog = byId('photo-dialog');
  const photoReady = [];
  document.body.classList.add('photos-loading');

  document.title = config.pageTitle || 'Semua tentang dia';
  byId('site-name').textContent = config.siteName || 'tentang dia';
  byId('eyebrow').textContent = config.eyebrow || 'seseorang yang selalu bikin senyum';
  byId('headline').replaceChildren(
    document.createTextNode(config.headline || 'Hal-hal indah'),
    document.createElement('br')
  );

  const highlight = document.createElement('em');
  highlight.textContent = config.highlight || 'tentang dia.';
  byId('headline').append(highlight);

  byId('footer-text').textContent =
    config.footer ||
    'sederhana, tapi istimewa. seperti dia.';

  function fallback(index) {
    const box = document.createElement('span');

    box.className = 'photo-fallback';
    box.textContent = String(index + 1).padStart(2, '0');

    box.setAttribute('role', 'img');
    box.setAttribute(
      'aria-label',
      `Kenangan ${index + 1}`
    );

    return box;
  }

  function photoImage(
    photo,
    index,
    trackLoading = false
  ) {
    const image =
      document.createElement('img');

    let markReady;

    const ready =
      new Promise(resolve => {
        markReady = resolve;
      });

    if (trackLoading) {
      photoReady.push(ready);
    }

    image.alt =
      photo.caption ||
      `Kenangan ${index + 1}`;

    image.draggable = false;

    image.style.objectPosition =
      photo.position ||
      '50% 50%';

    image.addEventListener(
      'load',
      () => {
        image.classList.add('is-ready');

        markReady();
      },
      {
        once: true
      }
    );

    image.addEventListener(
      'error',
      () => {
        image.replaceWith(
          fallback(index)
        );

        markReady();
      },
      {
        once: true
      }
    );

    image.setAttribute(
      'aria-busy',
      'true'
    );

    window.MemoryPhotos
      .load(photo.src)
      .then(source => {
        image.src = source;

        image.removeAttribute(
          'aria-busy'
        );
      })
      .catch(() => {
        const missing =
          fallback(index);

        missing.setAttribute(
          'aria-label',
          `Foto ${
            index + 1
          } belum dapat ditampilkan`
        );

        image.replaceWith(
          missing
        );

        markReady();
      });

    return image;
  }

  // Variasi dibuat sekali saat halaman dibuka.
  // Mengubah ukuran layar tidak mengacak foto lagi.
  // Setiap jalur naik punya kecepatan sama dan jarak aman.
  const variations =
    photos.map(() => ({
      size:
        .87 +
        Math.random() * .2,

      tilt:
        -4 +
        Math.random() * 8,

      lift:
        Math.random(),

      gap:
        Math.random()
    }));

  function shuffle(values) {
    for (
      let index =
        values.length - 1;
      index > 0;
      index--
    ) {
      const other =
        Math.floor(
          Math.random() *
          (index + 1)
        );

      [
        values[index],
        values[other]
      ] = [
        values[other],
        values[index]
      ];
    }

    return values;
  }

  const visualOrder =
    shuffle(
      photos.map(
        (_, index) => index
      )
    );

  function layoutPhotos() {
    const drifts = [
      ...document.querySelectorAll(
        '.photo-drift'
      )
    ];

    if (!drifts.length) {
      return;
    }

    drifts.forEach(
      drift => {
        drift.style.animationName =
          'none';
      }
    );

    const field =
      byId('photos');

    const top =
      Math.ceil(
        byId('headline')
          .closest('.dedication')
          .getBoundingClientRect()
          .bottom +
        16
      );

    const bottom =
      Math.floor(
        document
          .querySelector(
            '.bottom-note'
          )
          .getBoundingClientRect()
          .top -
        18
      );

    const available =
      Math.max(
        120,
        bottom - top
      );

    const laneCount =
      innerWidth <= 600
        ? 2
        : innerWidth <= 960
          ? 3
          : innerWidth <= 1300
            ? 4
            : 5;

    const laneWidth =
      innerWidth /
      laneCount;

    field.style.top =
      `${top}px`;

    field.style.height =
      `${available}px`;

    const lanes =
      Array.from(
        {
          length:
            laneCount
        },
        () => []
      );

    visualOrder.forEach(
      (
        index,
        rank
      ) =>
        lanes[
          rank %
          laneCount
        ].push(index)
    );

    const heights =
      new Map();

    function measure(
      index,
      baseSize
    ) {
      const drift =
        drifts[index];

      const variation =
        variations[index];

      const size =
        Math.round(
          baseSize *
          variation.size
        );

      const phraseWidth =
        Math.min(
          laneWidth - 24,
          Math.max(
            142,
            Math.round(
              size + 32
            )
          )
        );

      drift.style.setProperty(
        '--card-size',
        `${size}px`
      );

      drift.style.setProperty(
        '--item-width',
        `${phraseWidth}px`
      );

      drift.style.setProperty(
        '--phrase-width',
        `${phraseWidth}px`
      );

      drift.style.setProperty(
        '--rotate',
        `${variation.tilt.toFixed(
          2
        )}deg`
      );

      const phrase =
        drift.querySelector(
          '.phrase-drift'
        );

      if (phrase) {
        phrase.style.height =
          'auto';

        const key =
          `${phraseWidth}:${
            getComputedStyle(
              phrase
            ).fontSize
          }`;

        if (
          !heights.has(key)
        ) {
          const text =
            phrase.textContent;

          let maximum = 0;

          floatingPhrases.forEach(
            value => {
              phrase.textContent =
                value;

              maximum =
                Math.max(
                  maximum,
                  phrase.offsetHeight
                );
            }
          );

          phrase.textContent =
            text;

          heights.set(
            key,
            maximum
          );
        }

        phrase.style.height =
          `${heights.get(
            key
          )}px`;
      }

      const card =
        drift
          .querySelector(
            '.photo-card'
          )
          .getBoundingClientRect();

      return {
        width:
          Math.max(
            drift.offsetWidth,
            card.width
          ) +
          14,

        height:
          Math.max(
            drift.offsetHeight,
            card.height
          ) +
          18,

        photoHeight:
          card.height
      };
    }

    lanes.forEach(
      (
        indices,
        lane
      ) => {
        if (
          !indices.length
        ) {
          return;
        }

        const heightLimit =
          available < 250
            ? Math.max(
                64,
                (
                  available -
                  90
                ) /
                1.12
              )
            : 185;

        const base =
          Math.min(
            185,
            laneWidth *
              .70,
            heightLimit
          );

        const boxes =
          indices.map(
            index =>
              measure(
                index,
                base
              )
          );

        const gaps =
          indices.map(
            index =>
              (
                innerWidth <
                600
                  ? 40
                  : 52
              ) +
              variations[
                index
              ].gap *
                35
          );

        const contentHeight =
          boxes.reduce(
            (
              sum,
              box,
              index
            ) =>
              sum +
              box.height +
              gaps[index],
            0
          );

        const largest =
          Math.max(
            ...boxes.map(
              box =>
                box.height
            )
          );

        const distance =
          Math.max(
            contentHeight,
            available +
              largest * 2 +
              80
          );

        // ==================================================
        // MODIFIKASI UTAMA
        //
        // DULU:
        // const start=available+14;
        //
        // Itu bikin foto benar-benar berada di luar bawah.
        //
        // SEKARANG:
        // sekitar 38px foto sudah mulai masuk layar.
        // Begitu opening hilang, langsung terlihat.
        // ==================================================

        const start =
          Math.max(
            0,
            available - 38
          );

        const normalSpeed =
          (
            innerWidth <
            600
              ? 25
              : 30
          ) *
          (
            46 /
            duration
          ) *
          (
            .94 +
            (
              lane %
              3
            ) *
              .04
          );

        // Layar pendek perlu tempo
        // lebih tenang agar foto utuh
        // sempat terlihat.
        const viewingRoom =
          available *
            .9 -
          Math.max(
            ...boxes.map(
              box =>
                box.photoHeight
            )
          );

        const speed =
          Math.min(
            normalSpeed,
            Math.max(
              5,
              viewingRoom /
                7
            )
          );

        const seconds =
          distance /
          speed;

        // Delay lane dipangkas.
        // Dulu lane*1.3.
        const previewTime =
          (
            (
              start -
              (
                available -
                boxes[0]
                  .photoHeight
              ) /
                2
            ) /
              speed +
            lane *
              .16
          ) *
          1000;

        let cursor = 0;

        indices.forEach(
          (
            index,
            rank
          ) => {
            const box =
              boxes[rank];

            const drift =
              drifts[index];

            const slack =
              Math.max(
                0,
                laneWidth -
                  box.width -
                  16
              );

            drift.style.left =
              `${
                lane *
                  laneWidth +
                15 +
                slack *
                  variations[
                    index
                  ].lift
              }px`;

            drift.style.top =
              '0px';

            drift.style.setProperty(
              '--travel-start',
              `${start}px`
            );

            drift.style.setProperty(
              '--travel-end',
              `${
                start -
                distance
              }px`
            );

            drift.style.setProperty(
              '--duration',
              `${seconds}s`
            );

            drift.style.setProperty(
              '--preview-time',
              String(
                previewTime
              )
            );

            // ==================================================
            // MODIFIKASI UTAMA
            //
            // DULU:
            // cursor/speed + lane*1.3
            //
            // SEKARANG:
            // lane cuma beda 0.16 detik.
            //
            // Jadi foto pertama langsung naik
            // hampir bersamaan dari bawah.
            // ==================================================

            drift.style.setProperty(
              '--delay',
              `${
                cursor /
                  speed +
                lane *
                  .16
              }s`
            );

            cursor +=
              box.height +
              gaps[rank];
          }
        );
      }
    );

    // Restart all tracks together after a resize
    // so relative spacing stays exact.
    drifts.forEach(
      drift =>
        drift.style.removeProperty(
          'animation-name'
        )
    );

    if (
      reducedMotion.matches &&
      paused &&
      !document.body.classList.contains(
        'photos-loading'
      )
    ) {
      previewStillPhotos();
    }
  }

  function previewStillPhotos() {
    document
      .querySelectorAll(
        '.photo-drift'
      )
      .forEach(
        drift => {
          const animation =
            drift.getAnimations()[
              0
            ];

          if (animation) {
            animation.currentTime =
              Number(
                drift.style.getPropertyValue(
                  '--preview-time'
                )
              );
          }
        }
      );
  }

  photos.forEach(
    (
      photo,
      index
    ) => {
      const drift =
        document.createElement(
          'div'
        );

      drift.className =
        'photo-drift';

      const button =
        document.createElement(
          'button'
        );

      button.className =
        'photo-card';

      button.type =
        'button';

      button.setAttribute(
        'aria-label',
        `Lihat foto ${
          index + 1
        }: ${
          photo.caption ||
          'kenangan'
        }`
      );

      button.append(
        photoImage(
          photo,
          index,
          true
        )
      );

      const caption =
        document.createElement(
          'span'
        );

      caption.className =
        'photo-caption';

      caption.textContent =
        photo.caption ||
        `Kenangan ${
          index + 1
        }`;

      button.append(
        caption
      );

      button.addEventListener(
        'click',
        () =>
          openPhoto(
            index
          )
      );

      button.addEventListener(
        'focus',
        () =>
          document.body.classList.add(
            'focused'
          )
      );

      button.addEventListener(
        'blur',
        () =>
          document.body.classList.remove(
            'focused'
          )
      );

      drift.append(
        button
      );

      byId(
        'photos'
      ).append(
        drift
      );
    }
  );

  const colors = [
    '#315f79',
    '#84503c',
    '#85415f',
    '#376957'
  ];

  const floatingPhrases =
    Array.isArray(
      config.phrases
    )
      ? [
          ...new Set(
            config.phrases
              .filter(
                value =>
                  typeof value ===
                    'string' &&
                  value.trim()
              )
              .map(
                value =>
                  value.trim()
              )
          )
        ]
      : [];

  let phraseDeck = [];

  const activePhrases =
    new Set();

  function nextPhrase(
    previous
  ) {
    if (previous) {
      activePhrases.delete(
        previous
      );
    }

    let index =
      phraseDeck.findIndex(
        value =>
          value !==
            previous &&
          !activePhrases.has(
            value
          )
      );

    if (
      index < 0
    ) {
      phraseDeck =
        shuffle(
          floatingPhrases.filter(
            value =>
              value !==
                previous &&
              !activePhrases.has(
                value
              )
          )
        );

      index = 0;
    }

    const value =
      phraseDeck.splice(
        index,
        1
      )[0] ||
      previous ||
      floatingPhrases[0];

    activePhrases.add(
      value
    );

    return value;
  }

  document
    .querySelectorAll(
      '.photo-drift'
    )
    .forEach(
      (
        drift,
        index
      ) => {
        if (
          !floatingPhrases.length
        ) {
          return;
        }

        const phrase =
          document.createElement(
            'span'
          );

        phrase.className =
          'phrase-drift';

        phrase.textContent =
          nextPhrase();

        phrase.setAttribute(
          'aria-hidden',
          'true'
        );

        phrase.style.color =
          colors[
            index %
              colors.length
          ];

        drift.append(
          phrase
        );

        drift.addEventListener(
          'animationiteration',
          event => {
            if (
              event.target !==
                drift ||
              event.animationName !==
                'float-up'
            ) {
              return;
            }

            phrase.textContent =
              nextPhrase(
                phrase.textContent
              );
          }
        );
      }
    );

  layoutPhotos();

  const visiblePhotos =
    new IntersectionObserver(
      entries => {
        entries.forEach(
          entry => {
            entry.target.tabIndex =
              entry.intersectionRatio >=
              .75
                ? 0
                : -1;
          }
        );
      },
      {
        root:
          byId(
            'photos'
          ),

        threshold: [
          0,
          .75,
          1
        ]
      }
    );

  document
    .querySelectorAll(
      '.photo-card'
    )
    .forEach(
      card =>
        visiblePhotos.observe(
          card
        )
    );

  let resizeTimer;

  window.addEventListener(
    'resize',
    () => {
      clearTimeout(
        resizeTimer
      );

      resizeTimer =
        setTimeout(
          () => {
            layoutPhotos();
          },
          120
        );
    }
  );

  function openPhoto(
    index
  ) {
    byId(
      'enlarged-photo'
    ).replaceChildren(
      photoImage(
        photos[index],
        index
      )
    );

    byId(
      'photo-caption'
    ).textContent =
      photos[index]
        .caption ||
      `Kenangan ${
        index + 1
      }`;

    document.body.classList.add(
      'modal-open'
    );

    dialog.showModal();
  }

  byId(
    'dialog-close'
  ).addEventListener(
    'click',
    () =>
      dialog.close()
  );

  dialog.addEventListener(
    'click',
    event => {
      const bounds =
        dialog.getBoundingClientRect();

      if (
        event.target ===
          dialog &&
        (
          event.clientX <
            bounds.left ||
          event.clientX >
            bounds.right ||
          event.clientY <
            bounds.top ||
          event.clientY >
            bounds.bottom
        )
      ) {
        dialog.close();
      }
    }
  );

  dialog.addEventListener(
    'close',
    () =>
      document.body.classList.remove(
        'modal-open'
      )
  );

  function syncMotion() {
    document.body.classList.toggle(
      'paused',
      paused
    );

    const label =
      paused
        ? 'Lanjutkan animasi'
        : 'Jeda animasi';

    byId(
      'motion-toggle'
    ).setAttribute(
      'aria-pressed',
      String(paused)
    );

    byId(
      'motion-toggle'
    ).setAttribute(
      'aria-label',
      label
    );

    byId(
      'motion-toggle'
    ).title =
      label;
  }

  byId(
    'motion-toggle'
  ).addEventListener(
    'click',
    () => {
      paused =
        !paused;

      syncMotion();
    }
  );

  reducedMotion.addEventListener(
    'change',
    event => {
      paused =
        event.matches;

      syncMotion();
    }
  );

  syncMotion();

  function toast(
    message
  ) {
    clearTimeout(
      toastTimer
    );

    byId(
      'toast'
    ).textContent =
      message;

    byId(
      'toast'
    ).hidden =
      false;

    toastTimer =
      setTimeout(
        () => {
          byId(
            'toast'
          ).hidden =
            true;
        },
        4000
      );
  }

  let startMusicAfterIntro =
    () => {};

  if (
    config.music
  ) {
    const audio =
      new Audio(
        config.music
      );

    audio.loop =
      true;

    audio.preload =
      'auto';

    audio.volume =
      Number.isFinite(
        Number(
          config.musicVolume
        )
      )
        ? Math.max(
            0,
            Math.min(
              1,
              Number(
                config.musicVolume
              )
            )
          )
        : .45;

    const toggle =
      byId(
        'music-toggle'
      );

    toggle.hidden =
      false;

    let introFinished =
      false;

    let wantsMusic =
      config.musicAutoplay !==
      false;

    let waitingForGesture =
      false;

    let playPending =
      false;

    function syncAudio() {
      toggle.setAttribute(
        'aria-pressed',
        String(
          !audio.paused
        )
      );

      const label =
        audio.paused
          ? 'Putar musik'
          : 'Jeda musik';

      toggle.setAttribute(
        'aria-label',
        label
      );

      toggle.title =
        label;
    }

    async function playMusic() {
      if (
        playPending
      ) {
        return;
      }

      playPending =
        true;

      try {
        // Tetap dipanggil langsung di dalam
        // interaksi pengguna saat perlu izin suara.
        await audio.play();

        waitingForGesture =
          false;
      } catch (
        error
      ) {
        if (
          error.name ===
          'NotAllowedError'
        ) {
          waitingForGesture =
            wantsMusic;
        } else if (
          error.name !==
          'AbortError'
        ) {
          waitingForGesture =
            false;

          toast(
            'Musiknya belum bisa diputar. Coba lagi lewat tombol musik, ya.'
          );
        }
      } finally {
        playPending =
          false;

        syncAudio();
      }
    }

    startMusicAfterIntro =
      () => {
        introFinished =
          true;

        if (
          wantsMusic &&
          audio.paused
        ) {
          playMusic();
        }
      };

    function playOnInteraction(
      event
    ) {
      if (
        !event.isTrusted ||
        !introFinished ||
        !waitingForGesture ||
        !wantsMusic
      ) {
        return;
      }

      if (
        event.target instanceof
          Element &&
        event.target.closest(
          '#music-toggle'
        )
      ) {
        return;
      }

      if (
        event.type ===
          'keydown' &&
        (
          event.repeat ||
          ![
            'Enter',
            ' '
          ].includes(
            event.key
          )
        )
      ) {
        return;
      }

      playMusic();
    }

    document.addEventListener(
      'click',
      playOnInteraction
    );

    document.addEventListener(
      'keydown',
      playOnInteraction
    );

    toggle.addEventListener(
      'click',
      () => {
        if (
          audio.paused
        ) {
          wantsMusic =
            true;

          playMusic();
        } else {
          wantsMusic =
            false;

          waitingForGesture =
            false;

          audio.pause();
        }

        syncAudio();
      }
    );

    audio.addEventListener(
      'pause',
      syncAudio
    );

    audio.addEventListener(
      'play',
      syncAudio
    );

    audio.addEventListener(
      'error',
      syncAudio
    );
  }

  const introTime =
    reducedMotion.matches
      ? 0
      : Math.max(
          0,
          Number(
            config.introDuration
          ) ||
            0
        );

  const introReady =
    new Promise(
      resolve =>
        setTimeout(
          () => {
            const intro =
              byId(
                'intro'
              );

            let fallbackTimer;

            function finishIntro() {
              intro.removeEventListener(
                'transitionend',
                onTransitionEnd
              );

              clearTimeout(
                fallbackTimer
              );

              // Akhiri juga secara visual
              // jika browser menunda animasi pembuka.
              intro.style.transition =
                'none';

              intro.style.opacity =
                '0';

              intro.style.visibility =
                'hidden';

              resolve();
            }

            function onTransitionEnd(
              event
            ) {
              if (
                event.target ===
                  intro &&
                event.propertyName ===
                  'visibility'
              ) {
                finishIntro();
              }
            }

            intro.addEventListener(
              'transitionend',
              onTransitionEnd
            );

            intro.classList.add(
              'done'
            );

            intro.setAttribute(
              'aria-hidden',
              'true'
            );

            if (
              reducedMotion.matches
            ) {
              finishIntro();
            } else {
              fallbackTimer =
                setTimeout(
                  finishIntro,
                  850
                );
            }
          },
          introTime
        )
    );

  introReady.then(
    () =>
      startMusicAfterIntro()
  );

  // ========================================================
  // MODIFIKASI LOADING
  //
  // DULU:
  //
  // Promise.all([introReady,...photoReady])
  //
  // Artinya SEMUA foto harus selesai loading
  // baru animasi mulai.
  //
  // SEKARANG:
  // cuma foto gelombang pertama yang wajib siap.
  // Foto lainnya bisa lanjut loading sambil animasi berjalan.
  // ========================================================

  const firstWaveLaneCount =
    innerWidth <= 600
      ? 2
      : innerWidth <= 960
        ? 3
        : innerWidth <= 1300
          ? 4
          : 5;

  const firstWaveReady =
    visualOrder
      .slice(
        0,
        Math.min(
          firstWaveLaneCount,
          visualOrder.length
        )
      )
      .map(
        index =>
          photoReady[index]
      )
      .filter(Boolean);

  Promise.all([
    introReady,
    ...firstWaveReady
  ]).then(() => {
    document.body.classList.remove(
      'photos-loading'
    );

    if (
      reducedMotion.matches &&
      paused
    ) {
      // Pengguna yang mematikan gerak
      // tetap mendapat galeri diam yang terlihat.
      previewStillPhotos();
    }
  });
})();
