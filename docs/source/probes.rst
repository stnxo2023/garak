Probes
======

garak's probes each define a number of ways of testing a generator (typically an LLM)
for a specific vulnerability or failure mode.

For a detailed oversight into how a probe operates, see :doc:`probes/probes.base`.

For a guide to writing probes, see :doc:`extending.probe`.

.. toctree::
   :maxdepth: 2

   probes/probes.base
   probes/probes.ansiescape
   probes/probes.apikey
   probes/probes.atkgen
   probes/probes.audio
   probes/probes.av_spam_scanning
   probes/probes.continuation
   probes/probes.dan
   probes/probes.divergence
   probes/probes.doctor
   probes/probes.donotanswer
   probes/probes.dra
   probes/probes.encoding
   probes/probes.exploitation
   probes/probes.fileformats
   probes/probes.fitd
   probes/probes.glitch
   probes/probes.goodside
   probes/probes.grandma
   probes/probes.latentinjection
   probes/probes.leakreplay
   probes/probes.lmrc
   probes/probes.malwaregen
   probes/probes.misleading
   probes/probes.packagehallucination
   probes/probes.phrasing
   probes/probes.promptinject
   probes/probes.realtoxicityprompts
   probes/probes.sata
   probes/probes.snowball
   probes/probes.smuggling
   probes/probes.suffix
   probes/probes.tap
   probes/probes.test
   probes/probes.topic
   probes/probes.visual_jailbreak
   probes/probes.web_injection
   probes/probes.badchars
   probes/probes._tier
