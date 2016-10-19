// Reservations service used to communicate Reservations REST endpoints
(function () {
  'use strict';

  angular
    .module('reservations')
    .factory('ProgramsService', ProgramsService);

  ProgramsService.$inject = ['$resource'];

  function ProgramsService($resource) {
    var allPrograms = ['Byggteknik med arkitektur / Civil Engineering - Architecture',
                  'Civilingenjör i Riskhantering / Master of Science in Engineering, Risk Management and Safety Engineering',
                  'Arkitekt / Architect',
                  'Arkitekt / Architect',
                  'Medicin och teknik / Biomedical Engineering',
                  'Bioteknik / Biotechnology',
                  'Bioteknik / Biotechnology',
                  'Kemiteknik / Chemical Engineering',
                  'Kemiteknik / Chemical Engineering',
                  'Brandingenjörsutbildning / Fire Protection Engineering',
                  'Brandingenjörsutbildning / Fire Protection Engineering',
                  'Byggteknik med arkitektur / Civil Engineering - Architecture',
                  'Byggteknik med järnvägsteknik / Civil Engineering - Railway Construction',
                  'Byggteknik med järnvägsteknik / Civil Engineering - Railway Construction',
                  'Civil Engineering- Road and Traffic Technology / Civil Engineering- Road and Traffic Technology',
                  'Civil Engineering- Road and Traffic Technology / Civil Engineering- Road and Traffic Technology',
                  'Väg- och vattenbyggnad / Civil Engineering',
                  'Väg- och vattenbyggnad / Civil Engineering',
                  'Datateknik / Computer Science and Engineering',
                  'Datateknik / Computer Science and Engineering',
                  'Informations- och kommunikationsteknik / Information and Communication Engineering',
                  'Informations- och kommunikationsteknik / Information and Communication Engineering',
                  'Ekosystemteknik / Environmental Engineering',
                  'Elektroteknik / Electrical Engineering',
                  'Elektroteknik / Electrical Engineering',
                  'Teknisk Matematik / Engineering Mathematics',
                  'Teknisk Nanovetenskap / Engineering Nanoscience',
                  'Teknisk Fysik / Engineering Physics',
                  'Teknisk Matematik / Engineering Mathematics',
                  'Teknisk Fysik / Engineering Physics',
                  'Teknisk Nanovetenskap / Engineering Nanoscience',
                  'Ekosystemteknik / Environmental Engineering',
                  'Industridesign / Industrial Design',
                  'Industriell ekonomi / Industrial Engineering and Management',
                  'Industridesign / Industrial Design',
                  'Industriell ekonomi / Industrial Engineering and Management',
                  'Lantmäteri / Surveying',
                  'Maskinteknik med teknisk design / Mechanical Engineering with Industrial Design',
                  'Maskinteknik med teknisk design / Mechanical Engineering with Industrial Design',
                  'Maskinteknik / Mechanical Engineering',
                  'Maskinteknik / Mechanical Engineering',
                  'Medicin och teknik / Biomedical Engineering',
                  'Lantmäteri / Surveying'];
    return allPrograms;
  }
}());
