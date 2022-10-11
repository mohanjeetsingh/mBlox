/*!
 * mBlocks for Blogger
 * CIA.RealHappinessCenter.com
 * Copyright (c) 2022, Mohanjeet Singh
 * Released under the MIT license
 */
function mBlocks(m) {
    $(m).map(function () {
        /* SETTINGS PULLED FROM USER PLACEMENT + VALIDATION + DEFAULT SETTINGS APPLICATION */
        const
            e = $(this),
            la = e.attr("data-label") || "Label name missing",
            cTy = (e.attr("data-contentType") || "recent").toLowerCase(),// should be comments/label/recent
            l = e.attr("data-feed") || "https://mohanjeet.blogspot.com",//blogspot site url - default or custom
            T = e.attr("data-title") || "",
            D = e.attr("data-description") || "",
            ty = (e.attr("data-type") || "v-ih").toLowerCase(),
            bTy = ty.substring(0, 1),//block type
            t = ty.substring(1),
            isH = (-1 != t.search("h")),
            isI = (-1 != t.search("i")),
            isS = (-1 != t.search("s")),
            isA = (-1 != t.search("a")),
            h = e.attr("data-iHeight") || (bTy == "v" ? "100vh" : (bTy == "s" ? "70vh" : "m")),
            bH = h == 'm' ? '' : "height:" + h + "!important;",
            S = e.attr("data-s") || 1,//stage - code defined
            i1 = (e.attr("data-s") === undefined),//first instance - code defined
            bP = parseInt(e.attr("data-posts") || 3),
            mID = e.closest(".widget-content").parent(".widget").attr("ID") || (T + ty + la);
        let
            isB = (e.attr("data-iBlur") == "true") ? true : (e.attr("data-iBlur") == "false" ? false : (isH && (-1 == $.inArray(bTy, ["s", "l", "t", "p", "q"])))), //(default - true for non-image-only objects),
            bC = e.attr("data-cols"),//
            bR = parseInt(e.attr("data-rows") || 1),//
            isCa = (e.attr("data-isCarousel") || "").toLowerCase() == "true",
            isNav = false,
            w = "",
            f = l + "/feeds/",
            cI = '';//carousel indicators

        //console.log(el);
        //           console.log({tit,l,cor,thm,tva});
        //console.log({tit,mID,isL,cuSt});
        //console.log({bTy,isH,isI,isS,isC});
        //console.log({tit,isCa,isH,isS,isI,isCTA,isMo,isB});

        //FEED SETTING
        switch (cTy) {
            case "recent": f += "posts"; isI ? (f += "/default") : (f += "/summary"); break;
            case "comments": f += "comments"; isI ? (f += "/default") : (f += "/summary"); break;
            default: f += "posts"; isI ? (f += "/default") : (f += "/summary"); f += "/-/" + la;
        }
        f += "?alt=json-in-script&start-index=" + ((S - 1) * bP + 1) + "&max-results=" + bP;
        //console.log({tit,f,l,isI});

        //JSON PULL
        $.ajax({
            url: f,
            type: "get",
            dataType: "jsonp",
            success: function (fe) {
                if (fe.feed.entry) {
                    const l = fe.feed.entry.length,//Total number of actual posts in feed
                        toRe = fe.feed.openSearch$totalResults.$t,
                        snS = e.attr("data-snippetSize") || 150,
                        cor = ((e.attr("data-corner") || "").toLowerCase() == "sharp") ? " rounded-0" : " rounded",
                        tva = (e.attr("data-textVAlign") || (bTy == 'v' ? "middle" : (bTy == 'l' ? "bottom" : 'overlay'))).toLowerCase(),
                        thm = (e.attr("data-theme") || "light").toLowerCase(),// [light, dark, primary] 
                        iThm = (thm == "light" ? "primary" : "light"),//theme inverse
                        ar = " ratio ratio-" + (e.attr("data-ar") || "1x1").toLowerCase(),// [1x1,4x3,3x4,16:9,9:16,21:9,9:21]
                        bG = e.attr("data-gutter") || ((bTy == "v") ? 0 : 3),
                        isF = (e.attr("data-iFix") || "").toLowerCase() == "true",
                        isL = (e.attr("data-lowContrast") || "").toLowerCase() == "true",
                        isR = (e.attr("data-iBorder") || "").toLowerCase() == "true",
                        mo = e.attr("data-moreText") || "",
                        cta = e.attr("data-CTAText") || "",
                        isC = (bTy == "l" || bTy == "s"),
                        tS = Math.ceil(toRe / bP);//total stages
                    let b = '',//block body
                        fTy = bTy;
                    //console.log(fe.feed.entry);
                    //console.log(fe.feed.link);
                    //console.log({tit,b,fe,toRe,nuSt});

                    (bP <= 1 || bTy == "l") && (isCa = false);
                    if (isCa || isI) { var iW = window.innerWidth; }

                    //Image Resolution Setting
                    let s = 100;
                    if (isI && !isB) {
                        if (isF) { s = iW; } else {
                            switch (bC) {
                                case 1: s = iW;
                                case 2: iW < 768 ? s = iW : s = iW / 2;
                                case 3: iW < 768 ? s = iW : (iW < 992 ? s = iW / 2 : s = iW / 3);
                                case 4: iW < 576 ? s = iW : (iW < 768 ? s = iW / 2 : (iW < 992 ? s = iW / 3 : s = iW / 4));
                                case 5: iW < 576 ? s = iW / 2 : (iW < 768 ? s = iW / 3 : (iW < 1200 ? s = iW / 4 : s = iW / 5));
                                case 6: iW < 576 ? s = iW / 3 : (iW < 992 ? s = iW / 4 : (iW < 1200 ? s = iW / 5 : s = iW / 6));
                            }
                        }
                        s = Math.ceil(s / 100) * 100;
                    }

                    if (i1) {
                        e.attr("data-s", S);

                        //BLOCK HEADER - TITLE & DESCRIPTION
                        (T != "") && e.append('<div class="text-center m-0 bg-' + thm + ' py-5"><h4 class="display-6 text-' + iThm + ' py-3 m-0 ' + (isL ? "opacity-50" : "") + '">' + T + '</h4>' + ((D != "") ? ('<span class="pb-3 text-black-50">' + D + '</span>') : '') + '</div>');
                    }

                    if (typeof (bC) === "undefined") {
                        switch (bTy) {
                            case "v": case "t": bC = 1; break;
                            case "p": bC = 3; break;
                            case "c": case "q": bC = 4; break;
                            case "g": bC = 5; break;
                            case "l": bC = 2; break;
                            case "s": bC = 6; break;
                        }
                    } else { bC = parseInt(bC); (bC < 1) && (bC = 1); (bC > 6) && (bC = 6); }

                    //CAROUSEL COLUMNS ADJUSTMENT TO WINDOW SIZE
                    if (isCa) {
                        var aC = 0;

                        if (iW < 576) { bC < 5 ? aC = 1 : (bC == 5 ? aC = 2 : aC = 3); }
                        else if (iW < 768) { bC < 4 ? aC = 1 : (bC == 4 ? aC = 2 : (bC == 5 ? aC = 3 : aC = 4)); }
                        else if (iW < 992) { bC == 3 ? aC = 2 : (bC == 4 ? aC = 3 : aC = 4); }
                        else if (iW < 1200) { (bC > 4) && (bC == 5 ? aC = 4 : aC = 5); }
                        else { aC = bC; }
                        //console.log({tit,iW,bC,aC});

                        (bR > Math.ceil(l / bC)) && (bR = Math.ceil(l / bC));
                        (l <= (aC * bR)) && (isCa = false, isNav = true);
                    }
                    //CAROUSEL OPEN
                    if (isCa) {
                        cI = document.createElement("div");
                        $(cI).addClass('carousel-indicators');
                        (bTy != "v") && ($(cI).addClass('position-relative m-0'));
                    }
                    (isCa || isNav) && (b += '<div class="carousel-inner">');

                    //console.log({tit,bC,aC,bP,bR,l,toRe,isCa,isNav});

                    //BLOCK BODY WRAPPER
                    w = document.createElement('div');
                    w.id = 'm' + mID;
                    const m = $(w);
                    m.appendTo(e).attr({ "data-bs-ride": "carousel" });
                    w.className = ('overflow-hidden bg-' + thm + (bTy == "s" ? ' sFeature' : "") + ((isCa || isNav) ? (' st' + S + ' carousel carousel-fade') : ""));
                    //console.log({tit,l,b,bP,bC});
                    //console.log(fe.feed.entry);

                    //FEED LOOP FOR POSTS
                    for (let p = 0; p < l; p++) {
                        const it = fe.feed.entry[p],
                            ti = it.title.$t,
                            c = (isS || isI) && (("content" in it) ? it.content.$t : (("summary" in it) ? (it.summary.$t) : (("summary" in b_rc) ? (it.summary.$t) : "")));
                        let au = it.author[0].name.$t, sni = z = "";
                        //console.log({tit,it,ti,au});
                        //console.log({tit,p,fTy,bTy,fC,bC});

                        //LIST
                        (bTy == "l") && p > 0 && (isH ? (fTy = "t", bC--) : fTy = "c");

                        //<< POST COMPONENT LIBRARY >>
                        //AUTHOR INFO
                        isA && cTy != "comments" && ((au == "Anonymous" || au == "Unknown") ? (auur = "https://Mohanjeet.Blogspot.com", au = "Mohanjeet Singh") : (auur = it.author[0].uri.$t));

                        //DATE
                        /* O >> var o=it.published.$t,
                          //                      c=o.substring(0,4),
                            //                    m=o.substring(5,7),
                              //                  h=o.substring(8,10),
                                //                u=month_format[parseInt(m,10)]+" "+h+", "+c,
                        
                             var h=(it.published.$t,it.content.$t,it.published.$t),
                                              v=h.split("T"),
                                              m=" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][(v=v[0].split("-"))[1]-1]+" "+v[2]+", "+v[0];
                                              */

                        //TITLE - DISPLAY AND NORMAL
                        let hD = hN = "";
                        (fTy == "q") ? (hN = '<svg class="float-start link-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-quote" viewBox="0 0 16 16"><path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/></svg><blockquote class="blockquote link-primary text-start mt-2 ms-4">' + ti + '</blockquote>') : (isH && (hD = '<h3 class="display-5 mx-lg-5 ' + (isL ? "opacity-50" : "opacity-75") + '">' + ti + '</h3>', hN = '<h5 class="card-title fw-normal">' + ti + '</h5>'));

                        //COMMENT AUTHOR
                        (fTy == "q") && (sni += '<figcaption class="small text-muted">- ' + au + '</figcaption>');

                        //SNIPPET
                        if (isS) {
                            (z = c.replace(/<\S[^>]*>/g, "")).length > 70 && (z = z.substring(0, snS) + "...");
                            //console.log({ tit: T, it, c, z });
                            sni = '<summary class="list-unstyled' +
                                (thm == "light" ? ' text-muted' : ' opacity-75')+
                                (fTy == "v" ? ' py-3 d-block mx-lg-5' : '') +
                                (isL ? ' opacity-75' : '') +
                                '">' + z + '</summary>';
                        }

                        //LINK
                        let li = "";
                        for (let z = 0; z < it.link.length; z++) if ("alternate" == it.link[z].rel) { li = it.link[z].href; break; }
                        //                        console.log({tit},it.link[z].rel,it.link.length);

                        //IMAGE SETTINGS
                        let im = iU = iH = iV = imS = "";
                        if (isI) {
                            let iU = iH = noImg;
                            let z = $("<div>").html(c);
                            //console.log({iU,iH,c});
                            if (cTy == 'comments') {
                                iU = it.author[0].gd$image.src;
                                iU.match("blogblog.com") && (iU = noImg);
                            }
                            else {
                                //console.log({tit,c},c.indexOf("//www.youtube.com/embed/"));
                                if (c.indexOf("//www.youtube.com/embed/") > -1) {
                                    iV = it.media$thumbnail.url;//v-mThumb	
                                    //console.log({tit,iV});
                                    (-1 !== iV.indexOf("img.youtube.com")) && (iV = iV.replace("/default.jpg", "/maxresdefault.jpg"));
                                }
                                if (c.indexOf("<img") > -1) {
                                    iU = z.find("img:first").attr("src");
                                    (-1 !== iU.indexOf("/s72-c")) ? (iH = iU.replace("/s72-c", "/s1600")) : ((-1 !== iU.indexOf("/w640-h424")) ? iH = iU.replace("/w640-h424", "/s1600") : (iH = iU));
                                    (-1 !== iH.indexOf("/s1600")) && (iU = iH.replace("/s1600", "/s" + s));
                                    //console.log({s,iH,iU});
                                }
                            }
                            (iV == "") && (iV = iU);
                            //console.log({bTy,fTy,ty,p,iU,iH});

                            let iS = " object-fit:cover;height:100%!important;",
                                iC = ' w-100 img-fluid',
                                iSF = ' background:url(' + iH + ') fixed center center;background-size:cover;',
                                t = "";
                            switch (fTy) {
                                case "p": iC = ar; break;
                                case "q":
                                    iS += ' height:6rem!important;width:6rem;';
                                    iSF += ' height:6rem!important;width:6rem;';
                                    iC = ' rounded-circle mx-auto mt-3'; break;
                                case "t": iC = " col-4 h-100"; break;
                                case "s":
                                    var v = (-1 !== iV.indexOf("img.youtube.com")) ? (iV.substr(iV.indexOf("/vi/") + 4, 11)) : "regular";
                                    p == 0 && (imS = '<figure class="m-0' + iC + ' regular ' + (cor == " rounded" ? ' rounded-5 rounded-bottom' : cor) + '" style="' + iSF + bH + '" role="img" loading="lazy" aria-label="' + ti + ' image"' + t + '></figure>', t = '" data-toggle="tooltip" data-vidid="' + v + '"');
                                    iC += ar+' shadow-sm';
                                    break;
                                case "v": iSF += bH; break;
                            }
                            isB && !(cTy == "comments") && (iC += ' blur-5');

                            im = isF ? ('<figure class="m-0' + iC + '" style="' + iSF + '" role="img" loading="lazy" aria-label="' + ti + ' image"' + t + '></figure>') : ('<img class="' + iC + '" style="' + iS + '" src="' + iU + '" alt="' + ti + ' image" loading="lazy" title="' + ti + '" ' + t + '/>');
                            //console.log({imS});
                        }//IMAGE SETTINGS

                        //CTA BUTTON (purely visual therefore button instead of a)
                        let B = "";
                        if (cta != "" && fTy != "g") {
                            B = '<button class="btn ' +
                                ((cor != " rounded" || fTy == "p" || fTy == "q") ? 'rounded-0' : '') +
                                (isL ? " opacity-50" : " opacity-75");
                            switch (fTy) {
                                case "s": B += " p-3 px-lg-5 float-end"; break;
                                case "v": B += ' p-2 px-4  mx-lg-5 mt-4'; break;
                                case "p": case "q": B += ' py-2 px-3 w-100 text-end link-' + iThm; break;
                                case "t": B += ' mt-3'; break;
                                case "c": case "l": B += ' bottom-0 end-0 me-3 mb-3 d-block position-absolute w-auto'; break;
                            }
                            B += ' border-0 btn-' + thm + '" role="button" title="' + ti + '">' + cta + '</button>';
                        }

                        //CAROUSEL INDICATORS
                        isCa && (p % (aC * bR) == 0) && ($(cI).append('<button type="button" data-bs-target="#m' + mID + '" data-bs-slide-to="' + p / (aC * bR) + '" class="bg-' + iThm + (p == 0 ? (' active" aria-current="true"') : '"') + ' aria-label="Slide ' + (p / (aC * bR) + 1) + '"></button>'));

                        //SHOWCASE
                        fTy == "s" && i1 && p == 0 && m.before('<div class="feature-image card border-0 text-center bg-' + thm + ' overflow-hidden rounded-0"><div class="sIframe" style="display:none;"></div>' + imS + '<a class="link-' + iThm + '" href="' + li + '" title="' + ti + '">' + ((isH) ? ('<div class="sContent card-img-overlay rounded-0 ' + (cor == " rounded" && "rounded-top") + ' mx-md-5 p-3 px-lg-5 bg-' + thm + ' mt-auto" style="height:fit-content;">' + hN + ' ' + sni + '</div>') : "") + ((isI || cta != "") ? B : "") + '</a></div>');

                        //WRAPPER - CAROUSEL & CONTENT
                        if (p == 0 || (isCa && p % (aC * bR) == 0) || (bTy == "l" && p == 1)) {
                            b += '<div class="row  g-' + bG + ' mx-0';
                            isCa && ((b += ' carousel-item'), (p == 0) && (b += ' active'));
                            //isCa && console.log({ tit, bTy, fTy, p, b });
                            isC && (bTy == "l") && (b += ' col flex-grow-1');
                            (fTy != "v") && (!(isC && (fTy == "t" || fTy == "c")) && (b += ' pb-' + bG), (isCa || isNav) && (b += ' px-2 px-sm-3 px-md-4 px-lg-5'));
                            switch (bC) {
                                case 1: b += ' row-cols-1">'; break;
                                case 2: b += ' row-cols-1 row-cols-sm-1 row-cols-md-2">'; break;
                                case 3: b += ' row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3">'; break;
                                case 4: b += ' row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4">'; break;
                                case 5: b += ' row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-5">'; break;
                                case 6: b += ' row-cols-3 row-cols-sm-4 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">'; break;
                            }
                        }
                        //console.log({tit,p,b});

                        //ARTICLE START
                        b += '<article class="col d-inline-flex' + (fTy == "s" ? (' sPost" data-title="' + ti + '" data-link="' + li + '" data-summary="' + z + '" data-vidid="' + v + '" data-img="' + iV + '" data-toggle="tooltip"') : (fTy == "v" ?'" style='+bH+'"':'"')) + ' role="article">';

                        //LINK START
                        fTy != "s" && (b += '<a class="card overflow-hidden w-100 shadow-sm' +
                            (fTy != "v" ? cor : ' rounded-0') +
                            (isR ? (' border border-3 border-opacity-75 border-' + thm) : ' border-0') +
                            ((fTy == "q" || fTy == "v") ? ' text-center h-100' : (fTy == "t" ? " row g-0" : ((fTy == "l" || fTy == "c" || fTy == "g") ? ar + (fTy == "l" ? ' mt-' + bG : '') : ""))) + '" href="' + li + '" title="' + ti + '">');

                        //IMAGE
                        isI && (b += im);

                        //TEXT
                        if (isH && fTy != "s" && fTy != "g") {
                                switch (fTy) {
                                    case "t": isI && (b += '<div class="col-8">');
                                    case "p": case "q": b += '<div class="card-body' + (thm != "light" && (fTy == "p" || (bTy == "l" && fTy == "t")) ? (' bg-opacity-75 text-bg-' + thm) : ' text-'+ iThm) + '">';
                                        break;
                                    case "l": b += '<div class="text-bg-' + thm + ' bg-opacity-75 rounded-0 ps-5 py-3" style="height:fit-content;">Latest</div>';
                                    case "c": b += '<div class="text-bg-' + thm + ' bg-opacity-75 rounded-0 p-5';
                                        switch (tva) {
                                            case "top": b += ' h-auto">'; break;
                                            case "middle": b += ' h-auto top-50 translate-middle-y">'; break;
                                            case "bottom": b += ' h-auto bottom-0" style="top:auto;">'; break;
                                            case "overlay": b += '">'; break;
                                        }
                                        break;
                                    case "v": fTy == "v" && (b += '<div class="text-bg-' + thm + ' bg-opacity-75 p-4 p-sm-5 position-absolute w-75 ' + ((cor == " rounded" && tva != "overlay") ? ' rounded-5' : cor) + ' start-50 translate-middle');
                                        switch (tva) {
                                            case "top": b += '-x mt-5">'; break;
                                            case "middle": b += ' top-50">'; break;
                                            case "bottom": b += '-x  bottom-0 mb-5">'; break;
                                            case "overlay": b += ' top-50 h-100 w-100">'; break;
                                        }
                                }

                                (fTy == "v") ? b += hD : b += hN;
                                b += sni;
                                !(fTy == "p" || fTy == "q") && (b += B);//CTA 

                                b += '</div>';
                                fTy == "t" && isI && (b += '</div>');
                                (fTy == "p" || fTy == "q") && (b += B);//CTA - card footer type
                            }//TEXT
                        fTy != "s" && (b += '</a>');
                        b += '</article>';

                        (p == (l - 1) || (isCa && (p % (aC * bR) == (aC * bR - 1)))) && (b += '</div>');
                        //isCa&&console.log({tit,p,b});
                    }//feed

                    if (isCa || isNav) {
                        b += '</div>';

                        //CAROUSEL NAVIGATION AND WRAPPER CLOSURE
                        let L = R = "";
                        L = '<button class="carousel-control-prev link-secondary' + (isNav ? " nav-prev" : " pb-5") + '" type="button" title="Click for Previous" data-bs-target="#m' + mID + '" data-bs-slide="prev" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg><span class="visually-hidden">Previous</span></button>', R = '<button class="carousel-control-next link-secondary' + (isNav ? " nav-next" : " pb-5") + '" title="Click for Next" type="button" data-bs-target="#m' + mID + '" data-bs-slide="next" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg><span class="visually-hidden">Next</span></button>';
                        b += isCa ? (L + R) : "";
                        m.append(b);
                        m.append(cI);
                        isNav && ((S > 1) && m.append(L), (S < tS) && m.append(R));
                    } else { m.append(b); }

                    //BLOCK FOOTER - JUMP-LINK
                    //console.log((!(!isMo && bTy=='v')),ty);
                    let n = "";
                    (!(mo == "" && bTy == 'v')) && (n += '<nav aria-label="Page navigation" class="st' + S + ' w-100 pe-5 py-5 pagination justify-content-end bg-' + thm + '">');
                    if (mo != "") {
                        for (i = 0; i < fe.feed.link.length; i++) {
                            var r = fe.feed.link[i];
                            if ("alternate" == r.rel) {
                                var moLi = r.href;
                                //console.log(tit,r,r.href,r.rel);
                                n += '<a class="text-bg-' + thm + ' border-0 ' + (isL ? "opacity-50" : "opacity-75") + '" href="' + moLi + '?&max-results=12" title="Click for More">' + mo + ' <svg class="bi bi-caret-right-fill" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg></a>';
                            }
                        }
                    }
                    (!(mo == "" && bTy == 'v')) && (n += '</nav>');
                    m.after(n);
                }//if
                else {
                    switch (cTy) {
                        case "recent": e.append('<h2 class="text-center p-4 w-100">Nothing was posted recently!</h2>'); break;
                        case "comments": e.append('<h2 class="text-center p-4 w-100">Be the first one to comment!</h2>'); break;
                        default: e.append('<h2 class="text-center p-4 w-100">No content found for "' + la + '"!</h2>');
                    }
                } //console.log(b);
            },//success
            complete: function () {
                //NAV
                if (isNav) {
                    e.find(".nav-prev").unbind('click').click(function () {
                        const sC = (e.attr("data-s"));
                        e.attr("data-s", +sC - 1);
                        //console.log(s-2);
                        //console.log(el);
                        //console.log(el.attr("data-s"));
                        e.find(".st" + sC).fadeOut(); e.find(".st" + (sC - 1)).fadeIn();
                    });
                    e.find(".nav-next").unbind('click').click(function () {
                        const sC = (e.attr("data-s"));
                        e.find(".st" + sC).fadeOut();
                        //console.log(e.find(".st" +s).length==0);
                        e.attr("data-s", +sC + 1);
                        //console.log({ m, s: sC, t }, t == 0);
                        (e.find(".st" + (+sC + 1)).length == 0) ? mBlocks(e) : e.find(".st" + (+sC + 1)).fadeIn();
                    });
                }//if
                //SHOWCASE
                if (bTy == "s") {
                    const F = e.find(".feature-image");
                    const f = F.find("figure"), i = F.find(".sIframe"), c = F.find(".sContent");
                    f.click(function () {
                        let e = $(this).attr("data-vidid");
                        if (e !== "regular") {
                            i.html('<iframe src="https://www.youtube.com/embed/' + e + '?autoplay=1" allowfullscreen="" style="' + bH + 'width:100%;" frameborder="0"></iframe>'), i.fadeIn(0), f.fadeOut(0), c.fadeOut(0);
                        }
                    }),
                        e.find(".sPost").map(function () {
                            $(this).click(function () {
                                const v = $(this).attr("data-vidid"),
                                    t = $(this).attr("data-title");
                                (v.toLowerCase() != "regular") ? (ti = "Click here to load the video!") : (ti = t);
                                f.attr({ style: "background:url(" + $(this).attr("data-img") + ") center center;background-size:cover;" + bH, "data-vidid": v, title: ti, "aria-label": ti });
                                i.fadeOut(0), f.fadeIn(0),
                                    c.fadeIn(0), c.find("h5").html(t), c.find("summary").html($(this).attr("data-summary")),
                                    F.find("a").attr({ href: $(this).attr("data-link"), title: t }), F.find("button").attr("title", t);
                            })
                        })
                }
                //(isCa)&&console.log(b);
                //console.log(b);
            }//complete
        })//ajax
    });//$
}
$(document).ready(function () { mBlocks('.mBlock') });