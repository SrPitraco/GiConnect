'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">GiConnect documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChatPage.html" data-type="entity-link" >ChatPage</a>
                            </li>
                            <li class="link">
                                <a href="components/CrearClasePage.html" data-type="entity-link" >CrearClasePage</a>
                            </li>
                            <li class="link">
                                <a href="components/EditarUsuarioPage.html" data-type="entity-link" >EditarUsuarioPage</a>
                            </li>
                            <li class="link">
                                <a href="components/ForgotPasswordPage.html" data-type="entity-link" >ForgotPasswordPage</a>
                            </li>
                            <li class="link">
                                <a href="components/HomePage.html" data-type="entity-link" >HomePage</a>
                            </li>
                            <li class="link">
                                <a href="components/InstructorPopoverComponent.html" data-type="entity-link" >InstructorPopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginPage.html" data-type="entity-link" >LoginPage</a>
                            </li>
                            <li class="link">
                                <a href="components/MestrePortalPage.html" data-type="entity-link" >MestrePortalPage</a>
                            </li>
                            <li class="link">
                                <a href="components/ModificarUsuarioPage.html" data-type="entity-link" >ModificarUsuarioPage</a>
                            </li>
                            <li class="link">
                                <a href="components/PasarListaPage.html" data-type="entity-link" >PasarListaPage</a>
                            </li>
                            <li class="link">
                                <a href="components/PerfilPage.html" data-type="entity-link" >PerfilPage</a>
                            </li>
                            <li class="link">
                                <a href="components/PruebaPage.html" data-type="entity-link" >PruebaPage</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterPage.html" data-type="entity-link" >RegisterPage</a>
                            </li>
                            <li class="link">
                                <a href="components/ReservasPage.html" data-type="entity-link" >ReservasPage</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordPage.html" data-type="entity-link" >ResetPasswordPage</a>
                            </li>
                            <li class="link">
                                <a href="components/SuscripcionesPage.html" data-type="entity-link" >SuscripcionesPage</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChatService.html" data-type="entity-link" >ChatService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ClaseService.html" data-type="entity-link" >ClaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SuscripcionService.html" data-type="entity-link" >SuscripcionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserStateService.html" data-type="entity-link" >UserStateService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/AuthInterceptor.html" data-type="entity-link" >AuthInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Atleta.html" data-type="entity-link" >Atleta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthResponse.html" data-type="entity-link" >AuthResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChatMessage.html" data-type="entity-link" >ChatMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Clase.html" data-type="entity-link" >Clase</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Clase-1.html" data-type="entity-link" >Clase</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfirmarAsistenciaData.html" data-type="entity-link" >ConfirmarAsistenciaData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DiaSemana.html" data-type="entity-link" >DiaSemana</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FirebaseConfig.html" data-type="entity-link" >FirebaseConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NuevaSuscripcion.html" data-type="entity-link" >NuevaSuscripcion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Reserva.html" data-type="entity-link" >Reserva</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Reserva-1.html" data-type="entity-link" >Reserva</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Subscription.html" data-type="entity-link" >Subscription</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Suscripcion.html" data-type="entity-link" >Suscripcion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TipoSuscripcion.html" data-type="entity-link" >TipoSuscripcion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TipoSuscripcion-1.html" data-type="entity-link" >TipoSuscripcion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserData.html" data-type="entity-link" >UserData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Usuario.html" data-type="entity-link" >Usuario</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});