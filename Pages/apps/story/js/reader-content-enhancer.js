// IVS Story Reader - semantic enhancement for legacy chapter HTML.
// Converts visual-only paragraph patterns into meaningful reader classes
// without modifying source JSON or story canon.

(function initializeReaderContentEnhancer() {
    'use strict';

    const DIALOGUE_START = /^[“"'‘—–-]/;
    const QUOTED_DIALOGUE = /“[^”]+”|"[^"]+"/g;
    const SCENE_MARKER = /^(?:✦|✧|❖|◆|◇|⁂|\*\s*\*\s*\*)$/;
    const SENTENCE_END = /[.!?…:;”"']$/;

    function normalizeText(element) {
        return String(element?.textContent || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isLikelyDecree(text) {
        if (!text || text.length < 8 || text.length > 220) return false;
        const letters = text.match(/[A-Za-zÀ-ỹĐđ]/g) || [];
        if (letters.length < 6) return false;
        const uppercase = letters.filter((char) => char === char.toUpperCase()).length;
        return uppercase / letters.length >= 0.86;
    }

    function isShortBeat(text) {
        if (!text || text.length > 72) return false;
        const words = text.split(/\s+/).filter(Boolean);
        return words.length <= 10 || (words.length <= 14 && SENTENCE_END.test(text));
    }

    function locateTextPosition(root, absoluteOffset) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let traversed = 0;
        let lastNode = null;

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const length = node.nodeValue?.length || 0;
            const nextOffset = traversed + length;
            lastNode = node;

            if (absoluteOffset <= nextOffset) {
                return {
                    node,
                    offset: Math.max(0, Math.min(length, absoluteOffset - traversed)),
                };
            }

            traversed = nextOffset;
        }

        return lastNode
            ? { node: lastNode, offset: lastNode.nodeValue?.length || 0 }
            : null;
    }

    function isAlreadyItalicized(startNode, endNode) {
        const italicAncestor = startNode?.parentElement?.closest('em, i, .dialogue-quote');
        return Boolean(italicAncestor && italicAncestor.contains(endNode));
    }

    function italicizeQuotedDialogue(paragraph) {
        if (!paragraph || paragraph.dataset.dialogueItalicized === 'true') return;

        const rawText = String(paragraph.textContent || '');
        const matches = Array.from(rawText.matchAll(QUOTED_DIALOGUE))
            .filter((match) => match[0].slice(1, -1).trim().length > 0);

        // Process from the end so character offsets before each match remain stable.
        matches.reverse().forEach((match) => {
            const startOffset = match.index;
            const endOffset = startOffset + match[0].length;
            const start = locateTextPosition(paragraph, startOffset);
            const end = locateTextPosition(paragraph, endOffset);

            if (!start || !end || isAlreadyItalicized(start.node, end.node)) return;

            const range = document.createRange();
            range.setStart(start.node, start.offset);
            range.setEnd(end.node, end.offset);

            const emphasis = document.createElement('em');
            emphasis.className = 'dialogue-quote';
            emphasis.appendChild(range.extractContents());
            range.insertNode(emphasis);
        });

        paragraph.dataset.dialogueItalicized = 'true';
    }

    function createSceneBreak(paragraph) {
        const markerText = normalizeText(paragraph) || '✦';
        const separator = document.createElement('div');
        separator.className = 'scene-break';
        separator.setAttribute('role', 'separator');
        separator.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Scene break' : 'Chuyển cảnh');
        separator.innerHTML = `<span class="scene-break-symbol" aria-hidden="true">${markerText}</span>`;
        paragraph.replaceWith(separator);
        return separator;
    }

    function enhanceChapterBody(body) {
        if (!body || body.dataset.typographyEnhanced === 'true') return;

        const originalParagraphs = Array.from(body.querySelectorAll(':scope > p'));
        let firstProseParagraph = null;
        let afterSceneBreak = false;

        originalParagraphs.forEach((paragraph) => {
            const text = normalizeText(paragraph);

            if (SCENE_MARKER.test(text)) {
                createSceneBreak(paragraph);
                afterSceneBreak = true;
                return;
            }

            if (!text) {
                paragraph.remove();
                return;
            }

            italicizeQuotedDialogue(paragraph);
            paragraph.classList.toggle('is-dialogue', DIALOGUE_START.test(text));
            paragraph.classList.toggle('is-short', isShortBeat(text));
            paragraph.classList.toggle('is-decree', isLikelyDecree(text));

            if (afterSceneBreak) {
                paragraph.classList.add('is-section-opening');
                afterSceneBreak = false;
            }

            if (!firstProseParagraph && !paragraph.classList.contains('is-decree')) {
                firstProseParagraph = paragraph;
            }
        });

        if (firstProseParagraph) {
            firstProseParagraph.classList.add('is-chapter-opening');
        }

        body.dataset.typographyEnhanced = 'true';
    }

    function enhanceRenderedChapter(root = document) {
        root.querySelectorAll('.chapter-body').forEach(enhanceChapterBody);
    }

    const target = document.getElementById('dynamic-chapter-content');
    if (target) {
        const observer = new MutationObserver(() => enhanceRenderedChapter(target));
        observer.observe(target, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => enhanceRenderedChapter());
    } else {
        enhanceRenderedChapter();
    }
})();
