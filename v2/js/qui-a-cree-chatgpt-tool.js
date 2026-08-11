/* Quiz vrai ou faux sur les origines d'OpenAI et de ChatGPT.
   Article qui-a-cree-chatgpt. 100 % navigateur, aucun appel réseau.
   Faits vérifiés le 11 août 2026. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var zone = $('qcc-questions'), score = $('qcc-score'), meter = $('qcc-meter'),
      out = $('qcc-out'), copy = $('qcc-copy');
  if (!zone) return;

  var QUESTIONS = [
    { q: "Elon Musk fait partie des fondateurs d'OpenAI", r: true,
      x: "Vrai. Il compte parmi les onze cofondateurs de décembre 2015 et a coprésidé l'organisation avec Sam Altman." },
    { q: "OpenAI a été créée comme une entreprise à but lucratif", r: false,
      x: "Faux. OpenAI a été fondée en 2015 comme organisation à but non lucratif. La structure lucrative plafonnée date de 2019." },
    { q: "ChatGPT est sorti en novembre 2022", r: true,
      x: "Vrai, en accès libre. Il reposait alors sur GPT-3.5 et a dépassé le million d'inscriptions en cinq jours." },
    { q: "ChatGPT reposait sur GPT-4 à son lancement", r: false,
      x: "Faux. Il reposait sur GPT-3.5. GPT-4 n'est arrivé que le 14 mars 2023, soit quatre mois plus tard." },
    { q: "Sam Altman a quitté définitivement OpenAI en 2023", r: false,
      x: "Faux. Il a été écarté brièvement en novembre 2023 puis réintégré comme directeur général le 21 novembre 2023." },
    { q: "OpenAI a son siège à San Francisco", r: true,
      x: "Vrai, au 1455 3rd Street, en Californie." },
    { q: "OpenAI est aujourd'hui une public benefit corporation", r: true,
      x: "Vrai depuis le 28 octobre 2025. La structure lucrative est devenue OpenAI Group PBC, détenue notamment par la fondation OpenAI et par Microsoft." },
    { q: "ChatGPT et GPT désignent la même chose", r: false,
      x: "Faux. GPT est la famille de modèles, ChatGPT est l'application qui permet de dialoguer avec eux. La confusion est constante." }
  ];

  var reponses = {};

  function rendu() {
    zone.textContent = '';
    QUESTIONS.forEach(function (item, i) {
      var bloc = document.createElement('div');
      bloc.className = 'field';

      var p = document.createElement('p');
      p.className = 'rail-title';
      p.textContent = (i + 1) + '. ' + item.q;
      bloc.appendChild(p);

      [['vrai', 'Vrai'], ['faux', 'Faux']].forEach(function (opt) {
        var id = 'qcc-' + i + '-' + opt[0];
        var l = document.createElement('label');
        l.setAttribute('for', id);
        l.style.marginRight = '18px';
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'qcc-' + i;
        input.id = id;
        input.value = opt[0];
        input.addEventListener('change', function () {
          reponses[i] = (opt[0] === 'vrai');
          calcul();
        });
        l.appendChild(input);
        l.appendChild(document.createTextNode(' ' + opt[1]));
        bloc.appendChild(l);
      });

      zone.appendChild(bloc);
    });
  }

  function calcul() {
    var repondues = Object.keys(reponses).length;
    var justes = Object.keys(reponses).filter(function (k) {
      return reponses[k] === QUESTIONS[k].r;
    }).length;

    score.textContent = justes + ' / ' + QUESTIONS.length;
    if (meter) meter.style.width = Math.round((repondues / QUESTIONS.length) * 100) + '%';

    out.textContent = '';
    if (!repondues) {
      var v = document.createElement('p');
      v.textContent = "Répondez aux huit affirmations. Les corrections apparaissent au fur et à mesure.";
      out.appendChild(v);
      return { justes: justes, repondues: repondues };
    }

    var ul = document.createElement('ul');
    Object.keys(reponses).forEach(function (k) {
      var li = document.createElement('li');
      var b = document.createElement('strong');
      b.textContent = (reponses[k] === QUESTIONS[k].r ? 'Juste. ' : 'Faux. ');
      li.appendChild(b);
      li.appendChild(document.createTextNode(QUESTIONS[k].x));
      ul.appendChild(li);
    });
    out.appendChild(ul);
    return { justes: justes, repondues: repondues };
  }

  function copier() {
    var r = calcul();
    var texte = ['Quiz origines de ChatGPT : ' + r.justes + ' / ' + QUESTIONS.length, '']
      .concat(QUESTIONS.map(function (q, i) { return (i + 1) + '. ' + q.q + ' -> ' + q.x; }))
      .concat(['', 'Faits vérifiés le 11 août 2026.',
        'Source : anthony-courtin.com/blog/qui-a-cree-chatgpt']).join('\n');
    var fini = function (ok) {
      if (!copy) return;
      var a = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = a; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  }

  if (copy) copy.addEventListener('click', copier);
  rendu();
  calcul();
})();
