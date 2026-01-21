/**
 * Authentic n8n-style Custom Node Renderer for Vis-Network
 * Integrated with a Precision Layout Engine for Dimensional Parity.
 */

const nodeRenderer = {
    // Dictionary of Canvas-compatible Path2D icons
    icons: {
        shield: (ctx, x, y, size) => {
            ctx.moveTo(x, y - size / 2); ctx.lineTo(x + size / 2, y - size / 4);
            ctx.lineTo(x + size / 2, y + size / 4); ctx.quadraticCurveTo(x, y + size / 2, x - size / 2, y + size / 4);
            ctx.lineTo(x - size / 2, y - size / 4); ctx.closePath();
        },
        lock: (ctx, x, y, size) => {
            ctx.moveTo(x - size / 4, y - size / 6); ctx.lineTo(x - size / 4, y - size / 3);
            ctx.arc(x, y - size / 3, size / 4, Math.PI, 0); ctx.lineTo(x + size / 4, y - size / 6);
            ctx.stroke(); ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x - size / 3, y - size / 6, size * 2 / 3, size / 2, 2);
            else ctx.rect(x - size / 3, y - size / 6, size * 2 / 3, size / 2);
            ctx.fill();
        },
        server: (ctx, x, y, size) => {
            const h = size / 4;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x - size / 2, y - size / 2 + i * (h + 2), size, h, 2);
                else ctx.rect(x - size / 2, y - size / 2 + i * (h + 2), size, h);
                ctx.stroke();
                ctx.beginPath(); ctx.arc(x - size / 2 + 5, y - size / 2 + i * (h + 2) + h / 2, 1, 0, Math.PI * 2); ctx.fill();
            }
        },
        cloud: (ctx, x, y, size) => {
            ctx.moveTo(x - size / 3, y + size / 4); ctx.arc(x - size / 3, y, size / 4, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(x, y - size / 4, size / 3, Math.PI, 0); ctx.arc(x + size / 3, y, size / 4, Math.PI * 1.5, Math.PI * 0.5); ctx.closePath();
        },
        database: (ctx, x, y, size) => {
            const h = size / 3;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.ellipse(x, y - size / 2 + i * h + h / 2, size / 2, h / 2, 0, 0, Math.PI * 2); ctx.stroke();
                if (i < 2) {
                    ctx.moveTo(x - size / 2, y - size / 2 + i * h + h / 2); ctx.lineTo(x - size / 2, y - size / 2 + (i + 1) * h + h / 2);
                    ctx.moveTo(x + size / 2, y - size / 2 + i * h + h / 2); ctx.lineTo(x + size / 2, y - size / 2 + (i + 1) * h + h / 2);
                    ctx.stroke();
                }
            }
        },
        user: (ctx, x, y, size) => {
            ctx.arc(x, y - size / 4, size / 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(x, y + size / 2, size / 2.5, Math.PI, 0); ctx.stroke();
        },
        globe: (ctx, x, y, size) => {
            ctx.arc(x, y, size / 2, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(x, y, size / 5, size / 2, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x - size / 2, y); ctx.lineTo(x + size / 2, y); ctx.stroke();
        },
        key: (ctx, x, y, size) => {
            ctx.arc(x - size / 4, y, size / 4, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + size / 2, y);
            ctx.moveTo(x + size * 0.35, y); ctx.lineTo(x + size * 0.35, y + size / 6); ctx.stroke();
        },
        box: (ctx, x, y, size) => {
            const s = size / 2.5; ctx.moveTo(x, y - s); ctx.lineTo(x + s, y - s / 2); ctx.lineTo(x + s, y + s / 2);
            ctx.lineTo(x, y + s); ctx.lineTo(x - s, y + s / 2); ctx.lineTo(x - s, y - s / 2); ctx.closePath();
            ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
            ctx.moveTo(x, y); ctx.lineTo(x + s, y - s / 2); ctx.moveTo(x, y); ctx.lineTo(x - s, y - s / 2); ctx.stroke();
        },
        layers: (ctx, x, y, size) => {
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.moveTo(x - size / 2, y + i * 4 - size / 4); ctx.lineTo(x, y + i * 4);
                ctx.lineTo(x + size / 2, y + i * 4 - size / 4); ctx.lineTo(x, y + i * 4 - size / 2); ctx.closePath();
                ctx.fillStyle = i === 2 ? '#ff6d5f40' : 'transparent'; ctx.fill(); ctx.stroke();
            }
        },
        terminal: (ctx, x, y, size) => {
            ctx.moveTo(x - size / 2, y - size / 3); ctx.lineTo(x - size / 6, y); ctx.lineTo(x - size / 2, y + size / 3);
            ctx.moveTo(x - size / 8, y + size / 3); ctx.lineTo(x + size / 2, y + size / 3); ctx.stroke();
        },
        wifi: (ctx, x, y, size) => {
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.arc(x, y + size / 3, (size / 3) * (i + 1), Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
            }
            ctx.beginPath(); ctx.arc(x, y + size / 3, 2, 0, Math.PI * 2); ctx.fill();
        },
        activity: (ctx, x, y, size) => {
            ctx.moveTo(x - size / 2, y); ctx.lineTo(x - size / 4, y); ctx.lineTo(x - size / 8, y - size / 2);
            ctx.lineTo(x + size / 8, y + size / 2); ctx.lineTo(x + size / 4, y); ctx.lineTo(x + size / 2, y);
            ctx.stroke();
        },
        'alert-triangle': (ctx, x, y, size) => {
            ctx.moveTo(x, y - size / 2); ctx.lineTo(x + size / 2, y + size / 2); ctx.lineTo(x - size / 2, y + size / 2);
            ctx.closePath(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y - size / 4); ctx.lineTo(x, y + size / 8); ctx.moveTo(x, y + size / 4); ctx.arc(x, y + size / 4, 1, 0, Math.PI * 2); ctx.stroke();
        },
        zap: (ctx, x, y, size) => {
            ctx.moveTo(x + size / 8, y - size / 2); ctx.lineTo(x - size / 2, y); ctx.lineTo(x - size / 8, y);
            ctx.lineTo(x - size / 8, y + size / 2); ctx.lineTo(x + size / 2, y); ctx.lineTo(x + size / 8, y);
            ctx.closePath(); ctx.fill(); ctx.stroke();
        }
    },

    shapes: {
        roundedRect: (ctx, x, y, w, h) => {
            if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h / 2, w, h, 12);
            else ctx.rect(x - w / 2, y - h / 2, w, h);
        },
        rect: (ctx, x, y, w, h) => {
            ctx.rect(x - w / 2, y - h / 2, w, h);
        },
        square: (ctx, x, y, w, h) => {
            ctx.rect(x - w / 2, y - h / 2, w, h);
        },
        circle: (ctx, x, y, w, h) => {
            ctx.arc(x, y, w / 2, 0, Math.PI * 2);
        },
        rhombus: (ctx, x, y, w, h) => {
            ctx.moveTo(x, y - h / 2); ctx.lineTo(x + w / 2, y); ctx.lineTo(x, y + h / 2); ctx.lineTo(x - w / 2, y); ctx.closePath();
        },
        triangle: (ctx, x, y, w, h) => {
            ctx.moveTo(x, y - h / 2); ctx.lineTo(x + w / 2, y + h / 2); ctx.lineTo(x - w / 2, y + h / 2); ctx.closePath();
        },
        hexagon: (ctx, x, y, w, h) => {
            const rx = w / 2; const ry = h / 2;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const px = x + rx * Math.cos(angle);
                const py = y + ry * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
        },
        semicircle: (ctx, x, y, w, h) => {
            ctx.arc(x, y + h / 4, w / 2, Math.PI, 0); ctx.closePath();
        },
        puzzlePiece: (ctx, x, y, w, h) => {
            const r = 10; const left = x - w / 2; const top = y - h / 2;
            ctx.moveTo(left, top); ctx.lineTo(x - r, top); ctx.arc(x, top, r, Math.PI, 0, false); ctx.lineTo(left + w, top);
            ctx.lineTo(left + w, y - r); ctx.arc(left + w, y, r, Math.PI * 1.5, Math.PI * 0.5, true); ctx.lineTo(left + w, top + h);
            ctx.lineTo(left, top + h); ctx.lineTo(left, top); ctx.closePath();
        },
        andGate: (ctx, x, y, w, h) => {
            const left = x - w / 2; const right = x + w / 8;
            ctx.moveTo(left, y - h / 2); ctx.lineTo(right, y - h / 2);
            ctx.arc(right, y, h / 2, Math.PI * 1.5, Math.PI * 0.5, false);
            ctx.lineTo(left, y + h / 2); ctx.closePath();
        },
        orGate: (ctx, x, y, w, h) => {
            const left = x - w / 2;
            ctx.moveTo(left, y - h / 2);
            ctx.quadraticCurveTo(x - w / 4, y, left, y + h / 2);
            ctx.quadraticCurveTo(x, y + h / 2, x + w / 2, y);
            ctx.quadraticCurveTo(x, y - h / 2, left, y - h / 2);
            ctx.closePath();
        },
        notGate: (ctx, x, y, w, h) => {
            const left = x - w / 2.5; const apex = x + w / 6;
            ctx.moveTo(left, y - h / 2); ctx.lineTo(apex, y); ctx.lineTo(left, y + h / 2); ctx.closePath();
            // The circle will be handled as a separate path in drawNode
        }
    },

    getDimensions: function (shape, label, ctx) {
        let w = 200, h = 64;
        let fontSize = 13;

        switch (shape) {
            case 'square': w = 80; h = 80; break;
            case 'circle': w = 100; h = 100; break;
            case 'triangle': w = 120; h = 100; fontSize = 11; break;
            case 'rhombus': w = 120; h = 120; fontSize = 11; break;
            case 'hexagon': w = 120; h = 100; break;
            case 'semicircle': w = 120; h = 80; break;
            case 'andGate':
            case 'orGate': w = 180; h = 80; break;
            case 'notGate': w = 120; h = 64; break;
            case 'rect':
            case 'puzzlePiece': w = 160; h = 64; break;
            default: w = 160; h = 64; break; // roundedRect default
        }

        if (label && ctx) {
            ctx.font = `600 ${fontSize}px 'Inter', -apple-system, sans-serif`;
            const metrics = ctx.measureText(label);
            const textWidth = metrics.width;

            const isHorizontal = ['roundedRect', 'rect', 'puzzlePiece', 'andGate', 'orGate', 'notGate'].includes(shape || 'roundedRect');

            if (isHorizontal) {
                // Icon (32) + Gap (8) + Padding (40)
                const minWidth = textWidth + 80;
                if (minWidth > w) w = minWidth;
            } else {
                // For vertical shapes (circle, square), expand uniformly to maintain shape ratio if desired, 
                // or just ensure width covers it. For circle/square, usually aspect ratio 1:1 is best.
                const minSize = textWidth + 40;
                if (minSize > w) {
                    w = minSize;
                    if (shape === 'circle' || shape === 'square') h = minSize; // Keep 1:1
                    else h = h * (minSize / 120); // Scale height proportionally for others
                }
            }
        }

        return { width: w, height: h };
    },

    drawNode: function (ctx, { x, y, state, label, group, shape, icon, customColor, ports, isTransparent }) {
        const options = { ports };
        const isDark = document.body.classList.contains('dark-mode');
        const currentShape = shape || 'roundedRect';
        const currentIconKey = icon || group;

        // Pass label and ctx to get dynamic dimensions
        const dims = this.getDimensions(currentShape, label, ctx);
        const { width, height } = dims;

        // Color Logic: Priority -> customColor -> groupStyle -> fallback
        const dotColors = {
            world: '#2ea043', rhino: '#e36209', shield: '#ff6d5f',
            repo: '#8957e5', container: '#d29922', secret: '#cf222e',
            db: '#0969da', lb: '#6e7681', server: '#2ea043',
            cloud: '#58a6ff', user: '#0969da', lock: '#cf222e'
        };
        const dotColor = dotColors[currentIconKey] || dotColors[group] || '#6e7681';

        // Background Logic
        // 1. Transparent if explicity requested ('transparent') OR undefined (default).
        // 2. Solid/Tint if customColor is set to a hex/rgb value.
        let bgColor = 'rgba(255, 255, 255, 0)';

        if (customColor && customColor !== 'transparent') {
            bgColor = customColor;
        }

        const borderColor = isDark ? '#444c56' : '#e2e8f0';
        const textColor = isDark ? '#f0f6fc' : '#1f2328';
        const accentColor = '#ff6d5f';

        ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)';
        ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
        ctx.beginPath();
        const drawShape = this.shapes[currentShape] || this.shapes.roundedRect;
        drawShape(ctx, x, y, width, height);

        // Fill
        ctx.fillStyle = bgColor;
        ctx.fill();

        // Border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = state.selected ? accentColor : borderColor;
        ctx.lineWidth = state.selected ? 2.5 : 1.5;
        ctx.stroke();

        // Optional: Stripe for n8n style if transparent or white
        if (bgColor === 'rgba(255, 255, 255, 0)' || bgColor === '#ffffff' || bgColor === '#1c2128' || bgColor === 'transparent') {
            ctx.save();
            ctx.beginPath();
            const stripeWidth = 6;

            // Determine left edge based on shape geometry
            let leftEdge = x - width / 2;
            if (currentShape === 'notGate') leftEdge = x - width / 2.5;

            const topEdge = y - height / 2;

            const hasStraightLeft = ['roundedRect', 'rect', 'square', 'puzzlePiece', 'andGate', 'notGate'].includes(currentShape);

            if (hasStraightLeft) {
                if (currentShape === 'roundedRect') {
                    if (ctx.roundRect) ctx.roundRect(leftEdge, topEdge, stripeWidth, height, { tl: 12, bl: 12 });
                    else ctx.rect(leftEdge, topEdge, stripeWidth, height);
                } else {
                    ctx.rect(leftEdge, topEdge, stripeWidth, height);
                }
                ctx.fillStyle = dotColor; ctx.fill();
            }
            ctx.restore();
        }

        // 1b. Extra parts for logic gates
        if (currentShape === 'notGate') {
            const apex = x + width / 6;
            ctx.beginPath(); ctx.arc(apex + 8, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = bgColor; ctx.fill(); ctx.stroke();
        }

        // 2. Dynamic Content Layout
        let iconX = x; let iconY = y;
        let textX = x; let textY = y;
        let showText = true;
        let textAlign = 'center';

        const iconSize = 32; // Diameter
        const gap = 8;

        ctx.font = `600 13px 'Inter', -apple-system, sans-serif`;
        const textMetrics = ctx.measureText(label || '');
        const textWidth = textMetrics.width;

        const isHorizontal = ['roundedRect', 'rect', 'puzzlePiece', 'andGate', 'orGate'].includes(currentShape);
        const isVertical = ['circle', 'square', 'hexagon', 'semicircle', 'rhombus', 'triangle'].includes(currentShape);

        if (isHorizontal) {
            // Horizontal Layout: [Icon] [Text] centered
            const totalWidth = iconSize + gap + textWidth;
            const startX = x - totalWidth / 2;

            iconX = startX + iconSize / 2;
            textX = startX + iconSize + gap + textWidth / 2; // Text is drawn from center if textAlign=center (default)

            // Adjust because we set textAlign = 'center' generally, but here let's use 'left' for easier math? 
            // Actually, keep it simple: 
            textAlign = 'left';
            textX = startX + iconSize + gap;

            // Adjustments for specific shapes logic
            if (currentShape === 'andGate' || currentShape === 'orGate') {
                iconX -= 10; textX -= 10; // Shift left slightly to avoid curved right edge
            }

        } else if (isVertical) {
            // Vertical Layout: Icon above Text
            const totalHeight = iconSize + gap + 10; // 10 approx text height
            iconY = y - 8;
            textY = y + 16;

            if (currentShape === 'triangle') {
                iconY += 10; textY += 10; // Shift down for triangle center of gravity
            }
        } else if (currentShape === 'notGate') {
            iconX = x - 5; showText = false;
        }

        // Draw Icon Background
        ctx.beginPath(); ctx.arc(iconX, iconY, 16, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? dotColor + '30' : dotColor + '15'; ctx.fill();

        // Draw Icon
        ctx.beginPath(); ctx.strokeStyle = dotColor; ctx.lineWidth = 1.8;
        const drawIcon = this.icons[currentIconKey] || this.icons.shield;
        drawIcon(ctx, iconX, iconY, 16); ctx.stroke();

        // Draw Label
        if (showText && label) {
            let fontSize = 13;
            if (currentShape === 'rhombus' || currentShape === 'triangle') fontSize = 11;

            ctx.font = `600 ${fontSize}px 'Inter', -apple-system, sans-serif`;
            ctx.fillStyle = textColor;
            ctx.textAlign = textAlign;
            ctx.textBaseline = "middle";

            // Truncate if REALLY long (longer than node width - padding)
            let displayLabel = label;
            const maxWidth = width - 40;
            if (isHorizontal && textWidth > maxWidth) {
                // Simple char truncation approximation
                const approxChars = Math.floor(maxWidth / 7);
                if (displayLabel.length > approxChars) displayLabel = displayLabel.substring(0, approxChars) + '...';
            }

            ctx.fillText(displayLabel, textX, textY);
        }

        ctx.fillStyle = isDark ? '#30363d' : '#f0f2f5'; ctx.strokeStyle = borderColor; ctx.lineWidth = 1;
        let pOff = width / 2;
        if (currentShape === 'circle') pOff = width / 2;
        if (currentShape === 'square') pOff = width / 2;
        if (currentShape === 'triangle') pOff = width / 2;

        const pw = 8; const ph = 12;
        [-pOff, pOff].forEach(off => {
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x + off - pw / 2, y - ph / 2, pw, ph, 2);
            else ctx.rect(x + off - pw / 2, y - ph / 2, pw, ph);
            ctx.fill(); ctx.stroke();
        });

        // Draw Custom Ports if they exist
        if (options && options.ports && options.ports.length > 0) {
            options.ports.forEach(port => {
                let px = x;
                let py = y;
                const r = 5;

                // Calculate position based on side
                if (port.side === 'left') {
                    px = x - width / 2;
                    py = y; // Centered vertically on left edge by default
                } else if (port.side === 'right') {
                    px = x + width / 2;
                    py = y;
                } else if (port.side === 'top') {
                    px = x;
                    py = y - height / 2;
                } else if (port.side === 'bottom') {
                    px = x;
                    py = y + height / 2;
                }

                // Draw Port Connector
                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2);
                ctx.fillStyle = port.type === 'input' ? '#ffffff' : (isDark ? '#58a6ff' : '#0969da');
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
            });
        }
    }
};

window.nodeRenderer = nodeRenderer;
