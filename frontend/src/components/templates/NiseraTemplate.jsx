import React, { useState, useEffect } from 'react';
import AnimatedSection from '../AnimatedSection';
import { useSearchParams } from 'react-router-dom';
import { useCountdown } from '../../hooks/useCountdown.js';
import { useCalendarUrl } from '../../hooks/useCalendarUrl.js';
import FloatingMultimedia from '../FloatingMultimedia.jsx';
import PublicForms from '../PublicForms.jsx';
import Lightbox from './Lightbox';
import '../../styles/nisera-template.css';

export default function NiseraTemplate({ invitation, previewGuest }) {
    if (!invitation) return null;

    const theme = invitation.themeSettings || {};
    const profile = invitation.coupleProfile || {};
    const events = invitation.events || [];
    const gallery = invitation.galleryMedia || [];
    const typo = theme.typography || {};

    const brideName = profile.brideName || 'Annisa';
    const groomName = profile.groomName || 'Yasera';
    const brideFullName = profile.brideFullName || 'Annisa Salsabila';
    const groomFullName = profile.groomFullName || 'Yasera Putra';
    const brideParents = `Putri dari ${profile.brideFather || 'Bapak'} & ${profile.brideMother || 'Ibu'}`;
    const groomParents = `Putra dari ${profile.groomFather || 'Bapak'} & ${profile.groomMother || 'Ibu'}`;

    const defaultCoverImg = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800';
    const groomImg = profile.groomPhoto || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400';
    const brideImg = profile.bridePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400';
    
    const coverImg = theme.coverImageUrl || defaultCoverImg;

    // Tambahkan style binding di <div className="nisera...">


    return (
        <div className="nisera original preset-original" style={{
        '--heading-family': typo.fontHeading || '"Pinyon Script", cursive',
        '--body-text-family': typo.fontBody || '"Lancelot", serif',
    }}>
            <div className="kat-page__side-to-side">

    {/* Primary Pane */}
    <div className="primary-pane">

        <video className="bg-orn-video" autoPlay muted playsInline>
            <source src="/assets/nisera/nisera-vid-comp.mp4" type="video/mp4"  media="(min-width: 961px)" />
        </video>

        <div className="inner">

            <div className="primary-pane-content">
                {/* DETAILS */}
                <div className="primary-pane-details">
                    <div className="primary-pane-details--content">

                        <h2 className="primary-pane-title"   >Yasera<br /> &amp; <br /> Annisa
                        </h2>


                        <div className="link-wrap"   >
                            <p className="greeting-text">Kepada Yth, kami mengundang bapak/ibu/saudara/i</p>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    {/* Secondary Pane */}
    <div className="secondary-pane">

        {/* TOP COVER */}
        <div className="top-cover" data-section-order="opening_cover">

            <video className="bg-orn-video" id="tcVideo" autoPlay muted playsInline>
                <source  id="tcVideoSource" src="/assets/nisera/nisera-vid-mb.mp4" type="video/mp4" />
            </video>

            <div className=" inner">

                <div className="head-tc">
                    <div   >
                    </div>
                    <h2 className="top-cover-title"    id="trig-tc">Yasera<br /> &amp; <br /> Annisa
                    </h2>
                </div>

                <div className=" details">

                    <p    style={{}}>
                        Kepada Yth, kami mengundang bapak/ibu/saudara/i </p>



                    <div className="link-wrap"   >
                        <a href="javascript:;" onclick="startTheJourney()" className="link" id="startToExplore">
                            Buka Undangan</a>
                    </div>

                </div>
            </div>


        </div>

        {/* COVER */}
        <div className="cover " data-section-order="cover">

            <div className="bg-cover">
                <div className="image-wrap"   >
                    <img src="/assets/nisera/nisera-bg-cover.png" alt="orn-cover" />
                </div>
            </div>

            <div className="cover-mask"></div>

            <div className="orn-cover-1 top">
                <div className="image-wrap"   >
                    <img src="/assets/nisera/nisera-Orn-slip.png" alt="Ornament" />
                </div>
            </div>

            <div className="ornaments-wrapper">

                <div className="orn-cover-14 right">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-17.png" alt="Ornament" />
                    </div>

                    <div className="orn-cover-13">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-16.png" alt="Ornament" />
                        </div>
                    </div>

                    <div className="orn-cover-12 right">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-15.png" alt="Ornament" />
                        </div>
                    </div>
                </div>
                <div className="orn-cover-14 left">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-17.png" alt="Ornament" />
                    </div>

                    <div className="orn-cover-13">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-16.png" alt="Ornament" />
                        </div>
                    </div>

                    <div className="orn-cover-12 right">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-15.png" alt="Ornament" />
                        </div>
                    </div>
                </div>

            </div>

            <div className="inner">


                <div className="head"   >
                    <div className="logo-wrap"   >
                        <img src={coverImg}
                            alt="" className="logo" />
                    </div>
                    <p   >The Wedding of</p>
                    <h2   >Yasera & Annisa</h2>
                    <p   >#HanggarnyaAnnisa</p>
                </div>

                <div className="body highlight"   >
                    <div className="orn-cover-frame">

                        <div className="orn-cover-11 right">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-14.png" alt="Ornament" />
                            </div>
                        </div>

                        <div className="orn-cover-10 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-13.png" alt="Ornament" />
                            </div>
                        </div>

                        <div className="orn-cover-8 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-11.png" alt="" />
                            </div>
                        </div>

                        <div className="orn-cover-9 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-12.png" alt="Ornament" />
                            </div>
                        </div>

                        <div className="orn-cover-6 left">
                            <div className="orn-cover-6-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-08.png" alt="Ornament" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-07.png" alt="Ornament" />
                            </div>
                        </div>
                        <div className="orn-cover-7 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-10.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-cover-7 right">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-09.png" alt="" />
                            </div>
                        </div>

                        <div className="orn-cover-6 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-07.png" alt="Ornament" />
                            </div>
                        </div>

                        <div className="cover-frame" id="coverFrame">
                            <div className="cover-picture cover-show" id="cover-main">
                                <div className="picture desktop">
                                    <img src={coverImg}
                                        alt="" />
                                </div>
                                <div className="picture mobile">
                                    <img src={coverImg}
                                        alt="" />
                                </div>
                            </div>
                        </div>
                        <div className="image-wrap">
                            <img src="/assets/nisera/nisera-frame-cover.png" alt="Cover Frame" />
                        </div>

                        <div className="orn-cover-5 right">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-06.png" alt="Ornament" />
                            </div>
                        </div>

                        <div className="orn-cover-3 center">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-04.png" alt="" />
                            </div>
                        </div>

                        <div className="orn-cover-4 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-05.png" alt="" />
                            </div>
                        </div>

                        <div className="orn-cover-2 right">
                            <div className="orn-cover-2-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-03.png" alt="" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-02.png" alt="" />
                            </div>
                        </div>

                    </div>
                </div>
                <div className="ornaments-wrapper">
                    <div className="orn-cover-15 burung-1">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-burung-1.png" alt="Ornament" />
                        </div>
                    </div>
                    <div className="orn-cover-16 burung-2">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-burung-2.png" alt="Ornament" />
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* COUPLE */}
        <div className="couple-wrap" data-section-order="couple">
            <div className="couple">

                <div className="couple-head">

                    <div className="orn-cp-head right">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-clip-2.png" alt="Ornament" />
                        </div>
                    </div>
                    <div className="orn-cp-head left">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-clip-2.png" alt="Ornament" />
                        </div>
                    </div>

                    <h2 className="couple-title"  >Assalamualaikum Wr. Wb</h2>
                    <p className="couple-description"  >Dengan memohon rahmat &amp; ridho Allah SWT, Kami mengundang Bapak/Ibu/Saudara/i sekalian untuk menghadiri acara Ngunduh Mantu kami:</p>
                </div>

                <div className="couple-body   show-picture  ">
                    <div className="couple-info groom">

                        <div className="couple-details">
                            <div className="cp-top">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-cp.png" alt="orn-cover" />
                                </div>
                            </div>
                            <h2 className="couple-name"  >Yasera Hanggar Widosambari S.T</h2>
                        </div>

                        <div className="couple-preview">

                            <div className="couple-frame">

                                <div className="orn-couple-3">
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-23.png" alt="ornaments" />
                                    </div>
                                </div>

                                <div className="orn-couple-4 right">
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-24.png" alt="ornaments" />
                                    </div>
                                </div>
                                <div className="orn-couple-4 left">
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-24.png" alt="ornaments" />
                                    </div>
                                </div>

                                <div className="orn-couple-5">
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-22.png" alt="ornaments" />
                                    </div>
                                </div>

                                <div className="image-wrap"  >
                                    <img src="/assets/nisera/nisera-frame-couple.png" className="img-couple-frame" alt="Frame" />
                                </div>

                                <div className="couple-picture-wrap">
                                    <div className="couple-picture lightgallery"   >
                                        <a className="img-wrap" href="https://img.katsudoto.id/KlLuqVbhRJJtjoUIHCXKX7exSJ3Ou_khHbrO6Afjbk4/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI2NDktMTIwMC0xMjAwLTE3ODQyOTk0ODYtOTZjOWY4NDQzOGYwODk3NGE2NWFhYTQxLmpwZWc.webp"
                                            target="_blank">
                                                        <img className="img" src={groomImg} alt="" />
                                                    </a>
                                    </div>
                                </div>

                                <div className="orn-couple-1">
                                    <div className="orn-couple-1-1">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-19.png" alt="ornaments" />
                                        </div>
                                    </div>
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-18.png" alt="ornaments" />
                                    </div>
                                </div>

                                <div className="orn-couple-2">
                                    <div className="orn-couple-2-1">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-21.png" alt="ornaments" />
                                        </div>
                                    </div>
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-20.png" alt="ornaments" />
                                    </div>
                                </div>

                            </div>

                            <div className="orn-couple-edge right">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-25.png" alt="ornaments" />
                                </div>
                            </div>
                            <div className="orn-couple-edge left">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-25.png" alt="ornaments" />
                                </div>
                            </div>

                        </div>
                        <div className="couple-details">
                            <p className="couple-parents"  >Putra dari Bapak Sugeng Widodo S.Pd dan Ibu Samarti</p>
                            <div className="couple-link-wrap"  >
                                <a href="https://www.instagram.com/hanggaryasera" target="_blank" className="couple-link"><i className="fab fa-instagram"></i> @hanggaryasera</a>
                            </div>
                        </div>
                    </div>

                    <div className="separator-wrap">
                        <div className="separator"  >
                            <h2 className="couple-separator">&amp;</h2>
                        </div>
                    </div>

                    <div className="couple-info bride">

                        <div className="couple-details">
                            <div className="cp-top">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-cp.png" alt="orn-cover" />
                                </div>
                            </div>
                            <h2 className="couple-name"  >Annisa Sekar Dani Amd.I.Kom</h2>
                        </div>

                        <div className="couple-preview">
                            <div className="couple-frame">

                                <div className="orn-couple-3">
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-23.png" alt="ornaments" />
                                    </div>
                                </div>

                                <div className="orn-couple-4 right">
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-24.png" alt="ornaments" />
                                    </div>
                                </div>
                                <div className="orn-couple-4 left">
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-24.png" alt="ornaments" />
                                    </div>
                                </div>

                                <div className="orn-couple-5">
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-22.png" alt="ornaments" />
                                    </div>
                                </div>

                                <div className="image-wrap"  >
                                    <img src="/assets/nisera/nisera-frame-couple.png" className="img-couple-frame" alt="Frame" />
                                </div>

                                <div className="couple-picture-wrap">
                                    <div className="couple-picture lightgallery"   >
                                        <a className="img-wrap" href="https://img.katsudoto.id/V7wHhxm6Xya1B7-QQRhk9aq7Id0bQJAh90DmmCaV0-w/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI2NjktMTIwMC0xMjAwLTE3ODQzMTA2NTMtNDA0MjlmYzJjNzQ0NmQ1NmIxMmMxMTUwLmpwZWc.webp"
                                            target="_blank">
                                                        <img className="img" src={brideImg} alt="" />
                                                    </a>
                                    </div>
                                </div>

                                <div className="orn-couple-1">
                                    <div className="orn-couple-1-1">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-19.png" alt="ornaments" />
                                        </div>
                                    </div>
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-18.png" alt="ornaments" />
                                    </div>
                                </div>

                                <div className="orn-couple-2">
                                    <div className="orn-couple-2-1">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-21.png" alt="ornaments" />
                                        </div>
                                    </div>
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-20.png" alt="ornaments" />
                                    </div>
                                </div>

                            </div>

                            <div className="orn-couple-edge right">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-25.png" alt="ornaments" />
                                </div>
                            </div>
                            <div className="orn-couple-edge left">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-25.png" alt="ornaments" />
                                </div>
                            </div>

                        </div>
                        <div className="couple-details">
                            <p className="couple-parents"  >Putri dari Bapak Kasminto dan Ibu Kristina Widayati</p>
                            <div className="couple-link-wrap"  >
                                <a href="https://www.instagram.com/si_anida_" target="_blank" className="couple-link"><i className="fab fa-instagram"></i> @si_anida_</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* QUOTES */}
        <div className="quote-sec-wrap" data-section-order="quote">

            <div className="orn-clip-mask bot">
                <div className="image-wrap"   >
                    <img src="/assets/nisera/nisera-Orn-clip.png" alt="Ornament" />
                </div>
            </div>

            <div className="quote-sec-inner">

                <div className="ornaments-wrapper">
                    <div className="orn-qt-bg">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-bg-sd.png" alt="" />
                        </div>
                    </div>
                </div>

                <div className="frame-qt">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-frame-qt.png" alt="Background Awan" />
                    </div>
                </div>

                <div className="quote-sec">

                    <p className="quote-sec-caption"   >
                        "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar
                        benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berfikir"<br />
                        <br /> (Qs. Ar-Rum:21) </p>

                </div>

                <div className="ornaments-wrapper">
                    <div className="orn-qt-2 right">
                        <div className="orn-qt-2-2">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-11.png" alt="" />
                            </div>
                        </div>
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-17.png" alt="" />
                        </div>
                        <div className="orn-qt-2-1">
                            <div className="orn-qt-2-1-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-13.png" alt="" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-46.png" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="orn-qt-2 left">
                        <div className="orn-qt-2-2">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-11.png" alt="" />
                            </div>
                        </div>
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-17.png" alt="" />
                        </div>
                        <div className="orn-qt-2-1">
                            <div className="orn-qt-2-1-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-13.png" alt="" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-46.png" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="orn-qt-1 center">
                        <div className="orn-qt-1-1 right">
                            <div className="image-wrap"    >
                                <img src="/assets/nisera/nisera-Orn-47.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-qt-1-1 left">
                            <div className="image-wrap"    >
                                <img src="/assets/nisera/nisera-Orn-47.png" alt="" />
                            </div>
                        </div>
                        <div className="image-wrap" id="qt1-tr"   >
                            <img src="/assets/nisera/nisera-Orn-53.png" alt="" />
                        </div>
                    </div>
                </div>

            </div>
        </div>



        {/* Photo Wrap */}
        <div className="photo-wrap" data-section-order="gallery_photo">
            <div className="orn-photo-4 right">
                <div className="image-wrap"   >
                    <img src="/assets/nisera/nisera-Orn-30.png" alt="" />
                </div>
            </div>
            <div className="orn-photo-4 left">
                <div className="image-wrap"   >
                    <img src="/assets/nisera/nisera-Orn-30.png" alt="" />
                </div>
            </div>
            <div className="photo-inner">
                <div className="photo-head">
                    <h2 className="photo-title"  >Romansa Potrait</h2>
                </div>

                <div className="photo-body">
                    <div className="photo-nav-wrap">
                        <div className="photo-item">
                            <div className="preview-wrap" aria-hidden="true">
                                <div className="ornaments-wrapper">
                                    <div className="orn-photo-3 right">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-23.png" alt="" />
                                        </div>
                                    </div>
                                    <div className="orn-photo-3 left">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-23.png" alt="" />
                                        </div>
                                    </div>
                                    <div className="orn-photo-2 right">
                                        <div className="orn-photo-2-1">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-28.png" alt="" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-27.png" alt="" />
                                        </div>
                                    </div>
                                    <div className="orn-photo-2 left">
                                        <div className="orn-photo-2-1">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-28.png" alt="" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-27.png" alt="" />
                                        </div>
                                    </div>
                                    <div className="orn-photo-1 right">
                                        <div className="orn-photo-1-1">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-29.png" alt="" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-26.png" alt="" />
                                        </div>
                                    </div>
                                    <div className="orn-photo-1 left">
                                        <div className="orn-photo-1-1">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-29.png" alt="" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-26.png" alt="" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="photo-nav slider-syncing__preview"  >
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/1OskPxGgYGVvvEJfFhyKIUBe0RxMbbw_VZ7y1Z0eUW0/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI3OTktMjAwMC0yMDAwLTI4NjFiZjQ2NWZhYTRjZGFiOTAzNjM2My0wOTQ0ODguanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/WU3zpIhHDzJoLYRT-GZ1wiQ29QV4Vf8MnveuUM2PvgE/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI3OTktMjAwMC0yMDAwLTI4NjFiZjQ2NWZhYTRjZGFiOTAzNjM2My0wOTQ0ODguanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/0yeS3iwmg-90g3TRZMcOgQyut_nk_ONUeUFkG4RvAO4/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzEtMjAwMC0yMDAwLWZlMzkxNGRlMjgyZTRiOThmZjgyNTYyZC0zOWFjMDIuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/MU9_I0OKDrQokEnCsvRmGCe_QO0Um7ISW5vvptlbKe0/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzEtMjAwMC0yMDAwLWZlMzkxNGRlMjgyZTRiOThmZjgyNTYyZC0zOWFjMDIuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/zeWpAE6T94YdbuIdfLtGLkDFJ56mQ-8ixRDeV1P_aGE/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzctMjAwMC0yMDAwLTc1ZmZkZDliMTAxMzUzNmE4NzZiOGU3ZS1hYjcwYjIuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/OYRiAqHPVIFd983GJCsGKP2DRsSGjQxgd_BvHk1Klbs/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzctMjAwMC0yMDAwLTc1ZmZkZDliMTAxMzUzNmE4NzZiOGU3ZS1hYjcwYjIuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/kdPkkOqZiAd_plJR1ulMwNLvnFhjlIo0eOzCni23gcg/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzUtMjAwMC0yMDAwLTI5ZWQzZjJkNmY2NDg2NjIzMjVlOTIwNy1jYjgzYTYuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/Ld_XJVKvDVjjLvXBoMnafpqhv-w0TMpuxppmMG1Y8bs/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzUtMjAwMC0yMDAwLTI5ZWQzZjJkNmY2NDg2NjIzMjVlOTIwNy1jYjgzYTYuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/kFXe_l5ZEnPTr3mfPw8AUXuVMR2tHI73aivT-p9j92g/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzMtMjAwMC0yMDAwLTFlYzc5YzBiYTU4YTJjYTVhMzJhMjU1My05OTk5NjkuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/t4chv6WTiiA_GJzELpQnpAEfJjzsgNAK0rtLHXbku0A/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzMtMjAwMC0yMDAwLTFlYzc5YzBiYTU4YTJjYTVhMzJhMjU1My05OTk5NjkuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/3iaW7TWMyou-1TKBB2pxgoqwQ2n6If8diF-aCot1GBE/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MjktMjAwMC0yMDAwLWI3ZWM2OTQxY2EyZWMwNDdmOWZlODhiYy1hMzEzYmMuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/yFJeJYMt7q7nB-62HJPX28_AYnHZV0lu302kysOqXIQ/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MjktMjAwMC0yMDAwLWI3ZWM2OTQxY2EyZWMwNDdmOWZlODhiYy1hMzEzYmMuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/Dm9sU7uD_WsEtv-Iv8TyWHh5bTFUXtRureW9ZIrO9lE/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NzUtMjAwMC0yMDAwLTY4ZWViYWI4NTAyZTFjNmIyYWJlNmIyMy05ZDczMzMuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/5BS4-lPSH6qVl1gbyBvEwAxab3HTFa0skB7ATFXutjQ/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NzUtMjAwMC0yMDAwLTY4ZWViYWI4NTAyZTFjNmIyYWJlNmIyMy05ZDczMzMuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/aF8T_Jgtri71vJm7_TyTiUytDR-xb72ZqoywoUSuOgM/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzktMjAwMC0yMDAwLThlNGFkZjYwMTZkMDJiNTFlYzEwOGE0OC00Y2VkNjEuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/K6kONJsid0lN67m6Yfw-2XhIYX-9CoWOtribXwkfQS0/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4MzktMjAwMC0yMDAwLThlNGFkZjYwMTZkMDJiNTFlYzEwOGE0OC00Y2VkNjEuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/wzgaDi8mQgmIqkn7erok6XD0hazSG2OXNsSjdQc7azg/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDEtMjAwMC0yMDAwLTk4OWU4MDExMjk0NjE4MzUwY2EzNTU3Ny1lMDliZTMuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/7tiihxKK-AVESEUBL8dXFfy8loLdivFK3xIQ1mI-wd0/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDEtMjAwMC0yMDAwLTk4OWU4MDExMjk0NjE4MzUwY2EzNTU3Ny1lMDliZTMuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/m3WAV9y7fL4syN2HEJ1HLdvGUA71byBXm16yxRjLrAk/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDMtMjAwMC0yMDAwLTczMDNjZjU3OTQ0YTFmMGE4ZmRlNmM0My03ZjFiMWIuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/xjW89cBbxAEHpWSGXEvkARnPW1Y71IulKisnfxwZlxE/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDMtMjAwMC0yMDAwLTczMDNjZjU3OTQ0YTFmMGE4ZmRlNmM0My03ZjFiMWIuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/sJAZEJazg5J_L9aSMjiTpTJ26odlGI7JDXvFzRODgG4/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDUtMjAwMC0yMDAwLTY2ZTZiYTdlYThiNDdlZTIzNjdkNmRjZC0xOWRkYWYuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/MkArTn_5_Jb1J_F1mEgx7mzVc-ctEiVXbIX1zavR9p8/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDUtMjAwMC0yMDAwLTY2ZTZiYTdlYThiNDdlZTIzNjdkNmRjZC0xOWRkYWYuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/viH8drmtAPRYD9hCGmJ_YXW5fSNto7ZGTQaU7jmpmpc/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDctMjAwMC0yMDAwLTdlNzNmMDhhNzYwYThiOWM1ZWFkNWIyMy0zOTE0NDMuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/UjtnvM9OKblbjKK153RCvSlz4o452vLGtsiIvlIeiVU/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDctMjAwMC0yMDAwLTdlNzNmMDhhNzYwYThiOWM1ZWFkNWIyMy0zOTE0NDMuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/Dh5ySo-tKqmFfvbYxW2hccSBysubkHVOKB-hyHCtwMA/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDktMjAwMC0yMDAwLTcxNjhlMTI0NzdiODkyYzc3ZTc2MWU2Mi1lZjRkOGUuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/wDecqyumt-m8xB8lxZF0wQbs1LzpJyACwG5S4XV-57k/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NDktMjAwMC0yMDAwLTcxNjhlMTI0NzdiODkyYzc3ZTc2MWU2Mi1lZjRkOGUuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/-Gpvqqpv412mrc3JS-2YokFFyz0e3B0fs9q7Y7Fnyqw/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NTEtMjAwMC0yMDAwLWVkOGUzYWVjODFhZGE4NDc3MzVkOGJlYi1jZjI1MjUuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/X4v2qkgsWGDw4GevZVKn8-toduZdudfCoCx1XmA5a5U/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NTEtMjAwMC0yMDAwLWVkOGUzYWVjODFhZGE4NDc3MzVkOGJlYi1jZjI1MjUuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="preview-wrap">
                                    <div className="photo-img-wrap lightgallery">
                                        <a href="https://img.katsudoto.id/YFwJ8czWvAJd7U-Oizg0p9Q7NnZHJht9ZglLrW4z16g/rs:auto:2000:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NTMtMjAwMC0yMDAwLTNjZDUzMWI4YmFkNmQ3ZTNiZTA0MmExOC05MjcxYjYuanBn.webp"
                                            className="photo-link">
                                                    <img data-lazy="https://img.katsudoto.id/V7dLzXy2sUtGvegFKQLLqzjPeOjpRsAQ8VNySOG8vT0/rs:auto:1080:0:1/g:no/ar:1/q:90/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NTMtMjAwMC0yMDAwLTNjZDUzMWI4YmFkNmQ3ZTNiZTA0MmExOC05MjcxYjYuanBn.webp" alt="Gallery" className="photo-img" />
                                                </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="photo-slider-wrap">
                        <div className="photo-slider slider-syncing__nav"  >
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                            <div className="photo-item ">
                                <div className="photo-img-wrap">
                                    <img src={coverImg}
                                        alt="Gallery" className="photo-img " />
                                </div>
                            </div>
                        </div>

                        {/* Slider Nav */}
                        <button className="photo-arrow next">
                                <svg width="108" height="198" viewBox="0 0 108 198" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 190L100 99L8 8" stroke="black" strokeWidth="15" strokeLinecap="round"
                                        strokeLinejoin="round" />
                                </svg>
                            </button>
                        <button className="photo-arrow prev">
                                <svg width="108" height="198" viewBox="0 0 108 198" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 190L8 99L100 8" stroke="black" strokeWidth="15" strokeLinecap="round"
                                        strokeLinejoin="round" />
                                </svg>
                            </button>

                    </div>
                </div>
            </div>
        </div>


        {/* SAVE THE DATE */}
        <div className="save-date-wrap" data-section-order="save_the_date">
            <div className="ornaments-wrapper">
                <div className="orn-sd-bg">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-bg-sd.png" alt="" />
                    </div>
                </div>
            </div>
            <div className="save-date-head">
                <h2 className="save-date-title"  >
                    Hari Yang Ditunggu </h2>
            </div>

            <div className="save-date-frame">

                <div className="ornaments-wrapper">
                    <div className="orn-sd-5">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-36.png" alt="" />
                        </div>
                    </div>
                </div>

                <div className="image-wrap"  >
                    <img src="/assets/nisera/nisera-frame-sd.png" alt="" />
                </div>

                <div className="ornaments-wrapper">

                    <div className="orn-sd-4">
                        <div className="orn-sd-4-1">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-35.png" alt="" />
                            </div>
                        </div>
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-34.png" alt="" />
                        </div>
                    </div>
                    <div className="orn-sd-3">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-14.png" alt="" />
                        </div>
                    </div>
                    <div className="orn-sd-2">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-33.png" alt="" />
                        </div>
                    </div>
                    <div className="orn-sd-1">
                        <div className="orn-sd-1-1">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-11.png" alt="" />
                            </div>
                        </div>
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-32.png" alt="" />
                        </div>
                    </div>

                </div>

                <div className="save-date">
                    <div className="save-date-body">
                        <div className="countdown">
                            <div className="count-item"   >
                                <h2 className="count-num count-day">0</h2>
                                <small className="count-text">Hari</small>
                            </div>
                            <div className="count-item"   >
                                <h2 className="count-num count-hour">0</h2>
                                <small className="count-text">Jam</small>
                            </div>
                            <div className="count-item"   >
                                <h2 className="count-num count-minute">0</h2>
                                <small className="count-text">Menit</small>
                            </div>
                            <div className="count-item"   >
                                <h2 className="count-num count-second">0</h2>
                                <small className="count-text">Detik</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="add-to-calendar-wrap"   >
                <a className="add-to-calendar" href="https://www.google.com/calendar/render?action=TEMPLATE&amp;text=Yasera+%26+Annisa+Wedding&amp;dates=20260802T090000/20260802T120000&amp;location=Gedung+Pertemuan+Desa+Cangkol+Mojolaban+%7C+Jepuh%2C+Cangkol%2C+Kec.+Mojolaban%2C+Kabupaten+Sukoharjo%2C+Jawa+Tengah+57554%2C+Indonesia+%7C+Kabupaten+Sukoharjo&amp;details=Hai%2C+Kamu+diundang+pada+acara+pesta+pernikahan+kami+%7C+Pernikahan+Yasera+%26+Annisa+%7C+Minggu%2C+02+Agustus+2026"
                    target="_blank" rel="nofollow" id="addToCalendar">
                        Tambah ke Kalender                    </a>
            </div>
        </div>

        {/* AGENDA */}
        <div className="agenda-wrap" data-section-order="event">

            <div className="agenda-inner">

                <div className="agenda-head">
                    <h2 className="agenda-title"  >Wedding Event</h2>
                </div>

                <div className="agenda-body">
                    <div className="event-item ev-0 ">
                        <div className="event-head">
                            <div className="orn-act-top">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-67.png" alt="orn-cover" />
                                </div>
                            </div>
                            <h3 className="event-day"  >Minggu,</h3>
                            <h2 className="event-day"  >26 Juli, 2026</h2>
                            <p className="event-description"  >(Telah Dilaksanakan)</p>
                        </div>
                        <div className="activity-wrap  same-location ">
                            <div className="activity-item">
                                <div className="activity-frame">

                                    <div className="ornaments-wrapper">
                                        <div className="orn-event-8 center">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-48.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="orn-event-7 left">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-47.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="orn-event-7 right">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-47.png" alt="Orn" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="frame-wrap"   >
                                        <img src="/assets/nisera/nisera-frame-event.png" alt="" width="100" />
                                    </div>


                                </div>
                                <div className="activity-content">
                                    <div className="activity-head">
                                        <div className="activity-title-wrap"    data-aos-anchor-placement="top-bottom">
                                            <h3 className="activity-title">Akad Nikah</h3>
                                            <p className="activity-description"    data-aos-anchor-placement="top-bottom">Hanya di hadiri keluarga &amp; Kerabat Sahabat terdekat</p>
                                        </div>
                                    </div>
                                    <p className="activity-time"    data-aos-anchor-placement="top-bottom">07:30 - 10:00 WIB </p>
                                    <div className="activity-details">

                                        <p className="activity-address"  >Jl karya bhakti, gang simbang III, kel. Bebengan, Kec. Boja, Kendal, Jawa Tengah, 51381</p>
                                        <p className="activity-city"  >Kabupaten Kendal</p>
                                        <div className="activity-link-wrap"  ><a href="https://maps.google.com?q=-7.1077837124823295,110.2603333427304" className="event-link" target="_blank">Lihat Peta</a></div>
                                    </div>
                                </div>
                                <div className="ornaments-wrapper">

                                    <div className="orn-event-6 center">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-46.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-5">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-17.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-4">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-45.png" alt="Orn" />
                                        </div>
                                    </div>

                                    <div className="orn-event-3">
                                        <div className="orn-event-3-1">
                                            <div className="orn-event-3-1-1">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-36.png" alt="Orn" />
                                                </div>
                                                <div className="orn-event-3-1-1-1">
                                                    <div className="orn-event-3-1-1-1-1">
                                                        <div className="image-wrap"   >
                                                            <img src="/assets/nisera/nisera-Orn-34.png" alt="Orn" />
                                                        </div>
                                                    </div>
                                                    <div className="image-wrap"   >
                                                        <img src="/assets/nisera/nisera-Orn-40.png" alt="Orn" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-10.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-44.png" alt="Orn" />
                                        </div>
                                    </div>


                                    <div className="orn-event-2">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-43.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-1">
                                        <div className="orn-event-1-1">
                                            <div className="orn-event-1-1-1">
                                                <div className="orn-event-1-1-1-1">
                                                    <div className="image-wrap"   >
                                                        <img src="/assets/nisera/nisera-Orn-08.png" alt="Orn" />
                                                    </div>
                                                </div>
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-42.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-09.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-41.png" alt="Orn" />
                                        </div>
                                    </div>

                                    <div className="orn-event-9 burung-1">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-burung-1.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-10 burung-2">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-burung-2.png" alt="Orn" />
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-frame">

                                    <div className="ornaments-wrapper">
                                        <div className="orn-event-8 center">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-48.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="orn-event-7 left">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-47.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="orn-event-7 right">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-47.png" alt="Orn" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="frame-wrap"   >
                                        <img src="/assets/nisera/nisera-frame-event.png" alt="" width="100" />
                                    </div>


                                </div>
                                <div className="activity-content">
                                    <div className="activity-head">
                                        <div className="activity-title-wrap"    data-aos-anchor-placement="top-bottom">
                                            <h3 className="activity-title">Resepsi</h3>
                                        </div>
                                    </div>
                                    <p className="activity-time"    data-aos-anchor-placement="top-bottom">10:00 WIB - Selesai </p>
                                    <div className="activity-details">

                                        <p className="activity-address"  >Jl karya bhakti, gang simbang III, kel. Bebengan, Kec. Boja, Kendal, Jawa Tengah, 51381</p>
                                        <p className="activity-city"  >Kabupaten Kendal</p>
                                        <div className="activity-link-wrap"  ><a href="https://maps.google.com?q=-7.1077837124823295,110.2603333427304" className="event-link" target="_blank">Lihat Peta</a></div>
                                    </div>
                                </div>
                                <div className="ornaments-wrapper">

                                    <div className="orn-event-6 center">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-46.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-5">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-17.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-4">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-45.png" alt="Orn" />
                                        </div>
                                    </div>

                                    <div className="orn-event-3">
                                        <div className="orn-event-3-1">
                                            <div className="orn-event-3-1-1">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-36.png" alt="Orn" />
                                                </div>
                                                <div className="orn-event-3-1-1-1">
                                                    <div className="orn-event-3-1-1-1-1">
                                                        <div className="image-wrap"   >
                                                            <img src="/assets/nisera/nisera-Orn-34.png" alt="Orn" />
                                                        </div>
                                                    </div>
                                                    <div className="image-wrap"   >
                                                        <img src="/assets/nisera/nisera-Orn-40.png" alt="Orn" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-10.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-44.png" alt="Orn" />
                                        </div>
                                    </div>


                                    <div className="orn-event-2">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-43.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-1">
                                        <div className="orn-event-1-1">
                                            <div className="orn-event-1-1-1">
                                                <div className="orn-event-1-1-1-1">
                                                    <div className="image-wrap"   >
                                                        <img src="/assets/nisera/nisera-Orn-08.png" alt="Orn" />
                                                    </div>
                                                </div>
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-42.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-09.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-41.png" alt="Orn" />
                                        </div>
                                    </div>

                                    <div className="orn-event-9 burung-1">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-burung-1.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-10 burung-2">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-burung-2.png" alt="Orn" />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="p-relative">
                            <div className="ornaments-wrapper">
                                <div className="orn-dc-1 left">
                                    <div className="orn-dc-1-1">
                                        <div className="orn-dc-1-1-1">
                                            <div className="orn-dc-1-1-1-2">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-35.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="orn-dc-1-1-1-1">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-34.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-65.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-11.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-64.png" alt="Orn" />
                                    </div>
                                </div>
                                <div className="orn-dc-1 right">
                                    <div className="orn-dc-1-1">
                                        <div className="orn-dc-1-1-1">
                                            <div className="orn-dc-1-1-1-2">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-35.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="orn-dc-1-1-1-1">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-34.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-65.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-11.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-64.png" alt="Orn" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="event-item ev-1 ">
                        <div className="event-head">
                            <div className="orn-act-top">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-67.png" alt="orn-cover" />
                                </div>
                            </div>
                            <h3 className="event-day"  >Minggu,</h3>
                            <h2 className="event-day"  >02 Agustus, 2026</h2>
                            <p className="event-description"  >Unduh Mantu</p>
                        </div>
                        <div className="activity-wrap ">
                            <div className="activity-item">
                                <div className="activity-frame">

                                    <div className="ornaments-wrapper">
                                        <div className="orn-event-8 center">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-48.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="orn-event-7 left">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-47.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="orn-event-7 right">
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-47.png" alt="Orn" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="frame-wrap"   >
                                        <img src="/assets/nisera/nisera-frame-event.png" alt="" width="100" />
                                    </div>


                                </div>
                                <div className="activity-content">
                                    <div className="activity-head">
                                        <div className="activity-title-wrap"    data-aos-anchor-placement="top-bottom">
                                            <h3 className="activity-title">Ngunduh Mantu</h3>
                                        </div>
                                    </div>
                                    <p className="activity-time"    data-aos-anchor-placement="top-bottom">09:00 - 12:00 WIB </p>
                                    <div className="activity-details">
                                        <p className="activity-hall"    data-aos-anchor-placement="top-bottom">Gedung Pertemuan Desa Cangkol Mojolaban</p>
                                        <p className="activity-address"    data-aos-anchor-placement="top-bottom">Jepuh, Cangkol, Kec. Mojolaban, Kabupaten Sukoharjo, Jawa Tengah 57554, Indonesia</p>
                                        <p className="activity-city"    data-aos-anchor-placement="top-bottom">Kabupaten Sukoharjo</p>
                                        <div className="activity-link-wrap"    data-aos-anchor-placement="top-bottom"><a href="https://maps.google.com/?cid=13888708916520912091" className="activity-link" target="_blank">Lihat Peta</a></div>
                                    </div>
                                </div>
                                <div className="ornaments-wrapper">

                                    <div className="orn-event-6 center">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-46.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-5">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-17.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-4">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-45.png" alt="Orn" />
                                        </div>
                                    </div>

                                    <div className="orn-event-3">
                                        <div className="orn-event-3-1">
                                            <div className="orn-event-3-1-1">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-36.png" alt="Orn" />
                                                </div>
                                                <div className="orn-event-3-1-1-1">
                                                    <div className="orn-event-3-1-1-1-1">
                                                        <div className="image-wrap"   >
                                                            <img src="/assets/nisera/nisera-Orn-34.png" alt="Orn" />
                                                        </div>
                                                    </div>
                                                    <div className="image-wrap"   >
                                                        <img src="/assets/nisera/nisera-Orn-40.png" alt="Orn" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-10.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-44.png" alt="Orn" />
                                        </div>
                                    </div>


                                    <div className="orn-event-2">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-43.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-1">
                                        <div className="orn-event-1-1">
                                            <div className="orn-event-1-1-1">
                                                <div className="orn-event-1-1-1-1">
                                                    <div className="image-wrap"   >
                                                        <img src="/assets/nisera/nisera-Orn-08.png" alt="Orn" />
                                                    </div>
                                                </div>
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-42.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-09.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-41.png" alt="Orn" />
                                        </div>
                                    </div>

                                    <div className="orn-event-9 burung-1">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-burung-1.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="orn-event-10 burung-2">
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-burung-2.png" alt="Orn" />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="p-relative">
                            <div className="ornaments-wrapper">
                                <div className="orn-dc-1 left">
                                    <div className="orn-dc-1-1">
                                        <div className="orn-dc-1-1-1">
                                            <div className="orn-dc-1-1-1-2">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-35.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="orn-dc-1-1-1-1">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-34.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-65.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-11.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-64.png" alt="Orn" />
                                    </div>
                                </div>
                                <div className="orn-dc-1 right">
                                    <div className="orn-dc-1-1">
                                        <div className="orn-dc-1-1-1">
                                            <div className="orn-dc-1-1-1-2">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-35.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="orn-dc-1-1-1-1">
                                                <div className="image-wrap"   >
                                                    <img src="/assets/nisera/nisera-Orn-34.png" alt="Orn" />
                                                </div>
                                            </div>
                                            <div className="image-wrap"   >
                                                <img src="/assets/nisera/nisera-Orn-65.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap"   >
                                            <img src="/assets/nisera/nisera-Orn-11.png" alt="Orn" />
                                        </div>
                                    </div>
                                    <div className="image-wrap"   >
                                        <img src="/assets/nisera/nisera-Orn-64.png" alt="Orn" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </div>


        <div data-section-order="rsvp">


        </div>

        {/* LIVE STREAMING */}
        <div className="live-streaming" data-section-order="live_streaming">
            <div className="orn-clip-mask">
                <div className="image-wrap"   >
                    <img src="/assets/nisera/nisera-Orn-clip.png" alt="Ornament" />
                </div>
            </div>
            <div className="ornaments-wrapper"></div>
            <div className="inner">
                <div className="head">
                    <h2  >Live Streaming</h2>
                    <p  >Live Streaming Unduh Mantu</p>
                </div>
                <div className="body">
                    <div className="ornaments-wrapper">
                        <div className="orn-lv-5">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-14.png" alt="Ornament" />
                            </div>
                        </div>
                        <div className="orn-lv-2">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-24.png" alt="Ornament" />
                            </div>
                        </div>
                        <div className="orn-lv-3">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-26.png" alt="Ornament" />
                            </div>
                        </div>
                        <div className="orn-lv-1 right">
                            <div className="orn-lv-1-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-15.png" alt="Ornament" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-13.png" alt="Ornament" />
                            </div>
                        </div>
                    </div>
                    <div className="streaming-info"  >
                        <div className="p-relative">
                            <div className="preview  wide  youtube "  >
                                <img src="https://i3.ytimg.com/vi/www/default.jpg?nocache=1787074028" alt="" />
                                <button className="play-btn" data-video-id="https://www.youtube.com/live/7rwdVuCepiI?si=63Ibh8_0pRXhjgzw"><i className="fas fa-play"></i></button>
                            </div>
                        </div>
                        <div className="link"  >
                            <a href="https://www.youtube.com/live/7rwdVuCepiI?si=63Ibh8_0pRXhjgzw" target="_blank" rel="">Buka Tautan</a>
                        </div>
                    </div>
                    <div className="ornaments-wrapper">
                        <div className="orn-lv-4">
                            <div className="orn-lv-4-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-03.png" alt="Ornament" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-31.png" alt="Ornament" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div data-section-order="wedding_gift">
            {/* WEDDING GIFT */}
            <div className="wedding-gift-wrap ">
                <div className="wedding-gift-inner">

                    <div className="wedding-gift-head">
                        <div className="orn-agenda-top">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-01.png" alt="orn-cover" />
                            </div>
                        </div>
                        <h2 className="wedding-gift-title"  >
                            Wedding Gift </h2>
                        <p className="wedding-gift-description"  >
                            Your blessing and coming to our wedding are enough for us. However, if you want to give a gift we provide a Digital Envelope to make it easier for you. thank you </p>
                    </div>

                    <div className="wedding-gift-body-wrap">

                        <div className="wedding-gift-body no-gifts">
                            <div className="wedding-gift-body-inner">

                                <div className="wedding-gift-form">
                                    <form action="" method="POST" id="weddingGiftForm">

                                        {/* Details */}
                                        <div className="wedding-gift-details wedding-gift__first-slide wedding-gift-slide">
                                            {/* Select Bank */}
                                            <div className="wedding-gift-bank-wrap">
                                                <div className="accor-bank-wrap accor-active">
                                                    <div className="bank-btn-accordion bankBtnAccordion" id="bankBtnAccordion"   >
                                                        <p className="bank-btop-txt">
                                                            BANK MANDIRI (008)
                                                        </p>
                                                        <i className="ph-fill ph-control"></i>
                                                    </div>
                                                    <div className="gift-frame bankItemAccordion" id="bankItemAccordion">
                                                        <div className="frame-wrap">

                                                            <div className="image-wrap"   >
                                                                <img src="/assets/nisera/nisera-frame-bank.png" alt="Frame Gift" />
                                                            </div>

                                                            <div className="wedding-gift-body-ins"   >

                                                                {/* Bank Wrap */}
                                                                <div className="wedding-gift-bank-wrap no-scrollbar">
                                                                    <div className="bank-item" id="savingBook33189">

                                                                        <div className="bank-detail">
                                                                            <h3 className="bank-name">BANK MANDIRI (008)</h3>
                                                                            <p className="bank-account-number-label">
                                                                                No. Rekening:
                                                                                <span className="bank-account-number">1380026744818</span>
                                                                            </p>
                                                                            <p className="bank-account-name-label">
                                                                                Pemilik Rekening:
                                                                                <span className="bank-account-name">Yasera Hanggar Widosambari</span>
                                                                            </p>
                                                                            <div className="bank-button-wrap" data-copy="1380026744818">
                                                                                <i className="ph ph-copy-simple"></i>
                                                                                <p className="p">Salin Nomor Rekening</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>

                                                        <div className="ornaments-wrapper">
                                                            <div className="orn-bank-1">
                                                                <div className="orn-bank-1-1">
                                                                    <div className="orn-bank-1-1-1">
                                                                        <div className="image-wrap"   >
                                                                            <img src="/assets/nisera/nisera-Orn-38.png" alt="" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="image-wrap"   >
                                                                        <img src="/assets/nisera/nisera-Orn-14.png" alt="" />
                                                                    </div>
                                                                </div>
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-37.png" alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-3">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-12.png" alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-2">
                                                                <div className="orn-bank-2-1">
                                                                    <div className="image-wrap"   >
                                                                        <img src="/assets/nisera/nisera-Orn-40.png" alt="" />
                                                                    </div>
                                                                </div>
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-39.png" alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-4 right">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-30.png" alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-4 left">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-30.png" alt="" />
                                                                </div>
                                                            </div>

                                                            <div className="orn-bank-5 burung-1">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-burung-1.png" alt="Ornament" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-6 burung-2">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-burung-2.png" alt="Ornament" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="accor-bank-wrap accor-active">
                                                    <div className="bank-btn-accordion bankBtnAccordion" id="bankBtnAccordion"   >
                                                        <p className="bank-btop-txt">
                                                            BANK BCA (014)
                                                        </p>
                                                        <i className="ph-fill ph-control"></i>
                                                    </div>
                                                    <div className="gift-frame bankItemAccordion" id="bankItemAccordion">
                                                        <div className="frame-wrap">

                                                            <div className="image-wrap"   >
                                                                <img src="/assets/nisera/nisera-frame-bank.png" alt="Frame Gift" />
                                                            </div>

                                                            <div className="wedding-gift-body-ins"   >

                                                                {/* Bank Wrap */}
                                                                <div className="wedding-gift-bank-wrap no-scrollbar">
                                                                    <div className="bank-item" id="savingBook33191">

                                                                        <div className="bank-detail">
                                                                            <h3 className="bank-name">BANK BCA (014)</h3>
                                                                            <p className="bank-account-number-label">
                                                                                No. Rekening:
                                                                                <span className="bank-account-number">3271413538</span>
                                                                            </p>
                                                                            <p className="bank-account-name-label">
                                                                                Pemilik Rekening:
                                                                                <span className="bank-account-name">Yasera Hanggar Widosambari</span>
                                                                            </p>
                                                                            <div className="bank-button-wrap" data-copy="3271413538">
                                                                                <i className="ph ph-copy-simple"></i>
                                                                                <p className="p">Salin Nomor Rekening</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>

                                                        <div className="ornaments-wrapper">
                                                            <div className="orn-bank-1">
                                                                <div className="orn-bank-1-1">
                                                                    <div className="orn-bank-1-1-1">
                                                                        <div className="image-wrap"   >
                                                                            <img src="/assets/nisera/nisera-Orn-38.png" alt="" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="image-wrap"   >
                                                                        <img src="/assets/nisera/nisera-Orn-14.png" alt="" />
                                                                    </div>
                                                                </div>
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-37.png" alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-3">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-12.png" alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-2">
                                                                <div className="orn-bank-2-1">
                                                                    <div className="image-wrap"   >
                                                                        <img src="/assets/nisera/nisera-Orn-40.png" alt="" />
                                                                    </div>
                                                                </div>
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-39.png" alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-4 right">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-30.png" alt="" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-4 left">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-30.png" alt="" />
                                                                </div>
                                                            </div>

                                                            <div className="orn-bank-5 burung-1">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-burung-1.png" alt="Ornament" />
                                                                </div>
                                                            </div>
                                                            <div className="orn-bank-6 burung-2">
                                                                <div className="image-wrap"   >
                                                                    <img src="/assets/nisera/nisera-Orn-burung-2.png" alt="Ornament" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="slider-bank-wrap"   >
                                                <p className="sld-bank">Confirmation Form</p>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M4.23431 5.83392C4.54673 5.5215 5.05327 5.5215 5.36569 5.83392L8 8.46824L10.6343 5.83392C10.9467 5.5215 11.4533 5.5215 11.7657 5.83392C12.0781 6.14634 12.0781 6.65288 11.7657 6.96529L8.56569 10.1653C8.25327 10.4777 7.74673 10.4777 7.43431 10.1653L4.23431 6.96529C3.9219 6.65288 3.9219 6.14634 4.23431 5.83392Z" fill="#64744F" />
                                                            </svg>
                                            </div>

                                            {/* Sender Data */}
                                            <div className="gift-form-sender-wrapper"   >

                                                <div className="wedding-gift-sender-data-wrap">

                                                    <div className="form-group">
                                                        <input type="text" className="form-control" name="name" placeholder="Nama" value="" />
                                                    </div>

                                                    <div className="form-group">
                                                        <input type="text" className="form-control" name="account_name" placeholder="Nama pemilik rekening" />
                                                    </div>

                                                    <div className="form-group">
                                                        <textarea name="message" rows="1" className="form-control" placeholder="Pesan"></textarea>
                                                    </div>

                                                    <div className="form-group">
                                                        <input type="number" className="form-control" name="amount" placeholder="Nominal" />
                                                    </div>
                                                </div>

                                                <div style={{"display":"none"}}>
                                                    <input type="file" name="picture" id="weddingGiftPicture" data-wgu-preview="#weddingGiftPreview" style={{"display":"none"}} />
                                                    <input type="hidden" name="template" value="chitra" />
                                                    <input type="hidden" name="post" value="sendGift" />
                                                </div>

                                                {/* Wedding Gift Page */}
                                                <div className="wedding-gift-page-wrap">
                                                    <button type="button" className="wedding-gift-page wedding-gift__next">Lanjutkan</button>
                                                </div>

                                            </div>

                                        </div>

                                        {/* Picture */}
                                        <div className="wedding-gift-picture wedding-gift-slide">
                                            {/* Wedding Gift Back */}
                                            <div className="wedding-gift-back-page-wrap">
                                                <button type="button" className="wedding-gift-back-page wedding-gift__prev"><i
                                                                    className="fas fa-chevron-left"></i></button>
                                            </div>

                                            {/* Select Bank */}
                                            <div className="wedding-gift-select-bank-wrap">
                                                <select name="select_bank" id="selectBank" className="form-control"></select>
                                            </div>

                                            {/* Wedding Gift Upload */}
                                            <div className="wedding-gift-upload-wrap" data-wgu-file="#weddingGiftPicture">
                                                <div className="wgu-description show">
                                                    <img className="wgu-icon" src="https://katsudoto.id/media/kat/cloud-upload.png" alt="" />
                                                    <p className="wgu-title">Mohon upload bukti transfer</p>
                                                    <p className="wgu-desc">Screen Shoot / Foto Slip Transfer</p>
                                                </div>

                                                <div className="wgu-img-wrap">
                                                    <img className="wgu-img" id="weddingGiftPreview" src="" alt="" />
                                                </div>
                                            </div>

                                            {/* Wedding Gift Page */}
                                            <div className="wedding-gift-page-wrap">
                                                <button type="submit" className="wedding-gift-page submit">Konfirmasi</button>
                                            </div>
                                        </div>

                                    </form>
                                </div>

                            </div>
                        </div>

                        <div className="ornaments-wrapper">
                        </div>
                    </div>
                </div>
            </div>

            {/* HADIAH KADO */}
        </div>

        {/* Instagram Filter */}
        <div className="ig-filter-wrap" data-section-order="filter_instagram">

            <div className="orn-clip-mask bot">
                <div className="image-wrap"   >
                    <img src="/assets/nisera/nisera-Orn-clip.png" alt="Ornament" />
                </div>
            </div>

            <div className="ig-filter">

                <div className="ig-filter-head">
                    <div className="orn-rsvp-top">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-rt.png" alt="orn-cover" />
                        </div>
                    </div>

                    <h2 className="ig-filter-title"  >Wedding Filter</h2>

                    <p className="ig-filter-caption"   >Abadikan momen kamu ketika menghadiri acara pernikahan kami dengan menggunakan wedding filter di bawah.</p>
                </div>

                <div className="ig-filter-body">
                    <div className="ig-filter-body-inner">

                    </div>
                </div>

            </div>
        </div>

        {/* WEDDING WISH */}
        <div className="wedding-wish-wrap" data-template="" data-section-order="wedding_wish">

            <div className="wedding-wish-inner">
                <div className="wedding-wish-head">
                    <h2 className="wedding-wish-title"  >
                        Ucapan &amp; Harapan </h2>
                </div>

                <div className="wedding-wish-body">

                    <div className="wedding-wish-form">
                        <form action="" className="" method="POST" id="weddingWishForm">

                            <div>
                                <input type="hidden" name="guestId" value="" />
                                <input type="hidden" name="code" value="" />
                                <input type="hidden" name="post" value="newComment" />
                            </div>

                            <div className="form-group guest-name-wrap "   >
                                <input type="text" name="name" className="form-control guest-name" placeholder="Nama" value="" />
                            </div>

                            <div className="form-group guest-comment-wrap"   >
                                <textarea className="form-control guest-comment" name="comment" rows="1" placeholder="Berikan ucapan"></textarea>
                            </div>

                            <div className="submit-comment-wrap"   >
                                <button type="submit" className="submit submit-comment" data-last="">Kirim</button>
                            </div>

                        </form>
                    </div>

                    <div className="comment-wrap">
                        {/* COMMENTS */}

                    </div>

                    <div className="more-comment-wrap"  >
                        <button type="button" id="moreComment" data-template="" data-start="0" data-load-text="Memuat">Lebih banyak komentar</button>
                    </div>

                </div>

            </div>
        </div>

        {/* CATATAN */}
        <div className="quote-message-wrap" data-section-order="greet_thanks">
            <div className="quote-message">

                <div className="quote-message-inner-wrap">
                    <div className="quote-message-inner">
                        <div className="orn-agenda-top">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-01.png" alt="orn-cover" />
                            </div>
                        </div>
                        <h2 className="quote-message-title zin-3"   >Terima Kasih</h2>
                        <p className=" quote-message-desc zin-3"   >
                            Dari lubuk hati kami yang paling dalam, kami ingin mengucapkan terima kasih atas kehadiran kalian di hari spesial kami. Kami merasa sangat beruntung memiliki kalian dalam hidup kami dan merasa terhormat kalian dapat hadir bersama kami. </p>
                    </div>
                    <div className=" ornaments-wrapper">
                        <div className="orn-qm-4 right">
                            <div className="orn-qm-4-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-14.png" alt="" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-24.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-qm-4 left">
                            <div className="orn-qm-4-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-14.png" alt="" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-24.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-qm-3 right">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-55.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-qm-3 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-55.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-qm-2 right">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-10.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-qm-2 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-09.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-qm-1 right">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-54.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-qm-1 left">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-54.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Footnote */}
        <div className="footnote-wrap" data-section-order="footnote">

            <div className="ornaments-wrapper">

                <div className="orn-tc-1">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-61.png" alt="" />
                    </div>
                </div>
                <div className="orn-tc-3">
                    <div className="orn-tc-3-2 right">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-63.png" alt="" />
                        </div>
                    </div>
                    <div className="orn-tc-3-2 left">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-63.png" alt="" />
                        </div>
                    </div>
                    <div className="orn-tc-3-1 right">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-17.png" alt="" />
                        </div>
                    </div>
                    <div className="orn-tc-3-1 left">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-17.png" alt="" />
                        </div>
                    </div>
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-53.png" alt="" />
                    </div>
                </div>
                <div className="orn-tc-2">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-62.png" alt="" />
                    </div>
                </div>

                <div className="orn-tc-4 right">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-30.png" alt="" />
                    </div>
                </div>

                <div className="orn-tc-4 left">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-30.png" alt="" />
                    </div>
                </div>

                <div className="orn-ff-5">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-slip.png" alt="" />
                    </div>
                </div>

            </div>

            <div className="footnote">

                <div className="orn-wrapper">
                    <div className="orn-footnote-logo">
                        <div className="image-wrap"   >
                            <img src={coverImg}
                                alt="" className="logo" />
                        </div>
                    </div>
                </div>

                <div className="content">
                    <p className="top-text"   >Matur Nuwun</p>
                    <h2 className="footnote-title"   >Yasera<br />&<br />Annisa</h2>
                    <p className="bottom-text"   >Kami yang berbahagia</p>
                </div>

                <div className="orn-ff-log1 burung-1">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-burung-1.png" alt="Ornament" />
                    </div>
                </div>
                <div className="orn-ff-log2 burung-2">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-burung-2.png" alt="Ornament" />
                    </div>
                </div>

            </div>

            <div className=" ornaments-wrapper">
                <div className="orn-ff-4">
                    <div className="orn-ff-4-2">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-12.png" alt="" />
                        </div>
                    </div>
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-23.png" alt="" />
                    </div>
                    <div className="orn-ff-4-1">
                        <div className="orn-ff-4-1-1">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-16.png" alt="" />
                            </div>
                        </div>
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-60.png" alt="" />
                        </div>
                    </div>
                </div>
                <div className="orn-ff-3">
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-46.png" alt="" />
                    </div>
                </div>
                <div className="orn-ff-2">
                    <div className="orn-ff-2-1">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-59.png" alt="" />
                        </div>
                    </div>
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-58.png" alt="" />
                    </div>
                </div>
                <div className="orn-ff-1">
                    <div className="orn-ff-1-3">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-13.png" alt="" />
                        </div>
                    </div>
                    <div className="orn-ff-1-2">
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-23.png" alt="" />
                        </div>
                        <div className="orn-ff-1-2-1">
                            <div className="orn-ff-1-2-1-1">
                                <div className="image-wrap"   >
                                    <img src="/assets/nisera/nisera-Orn-34.png" alt="" />
                                </div>
                            </div>
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-40.png" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="orn-ff-1-1">
                        <div className="orn-ff-1-1-2">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-14.png" alt="" />
                            </div>
                        </div>
                        <div className="orn-ff-1-1-1">
                            <div className="image-wrap"   >
                                <img src="/assets/nisera/nisera-Orn-35.png" alt="" />
                            </div>
                        </div>
                        <div className="image-wrap"   >
                            <img src="/assets/nisera/nisera-Orn-57.png" alt="" />
                        </div>
                    </div>
                    <div className="image-wrap"   >
                        <img src="/assets/nisera/nisera-Orn-56.png" alt="" />
                    </div>
                </div>
            </div>

        </div>

        {/* FOOTER */}
        
        <div className=" footer" data-section-footer>
            <div className="foot-wrap">
                <p>Nisera Template by Katsudoto - Adapted for UndanganManten</p>
            </div>
        </div>
    </div>
  </div>
</div>
  );
}
