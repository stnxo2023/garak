# Documentation

## Building the Documentation

1. Build the documentation:

   ```console
   make -C docs/source doc
   ```

   The HTML is created in the `docs/source/html` directory.

## Style Conventions

- When to use garak, Garak, and ``garak``?

  - The project is named garak.
    Type it in lowercase and no styling when you refer to the project or the Python package.
    We'll add to this list as more circumstances are discovered.
    This plain-text presentation should be the most frequent use.

    Can you start a sentence with garak?
    Yes.

    Should you?
    Problably not.
    Only start with garak if rephrasing the sentence introduces passive voice or the sentence becomes awkward.

  - The command is ``garak``.
    If the context is to instruct the reader to run the ``garak`` command, then style it as inline code.

  - In a heading, it's Garak with an uppercase G because it's a heading.

## Publishing the Documentation

Tag the commit to publish with `docs-v<semver>`.

To avoid publishing the documentation as the latest, ensure the commit has `/not-latest` on a single line, tag that commit, and push to GitHub.
