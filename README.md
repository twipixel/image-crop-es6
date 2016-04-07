# ES6 프로젝트 샘플입니다.

[실시간 트랜스파일과 모듈화된 프론트앤드 개발환경](http://firejune.com/1797/%EC%8B%A4%EC%8B%9C%EA%B0%84+%ED%8A%B8%EB%9E%9C%EC%8A%A4%ED%8C%8C%EC%9D%BC%EA%B3%BC+%EB%AA%A8%EB%93%88%ED%99%94%EB%90%9C+%ED%94%84%EB%A1%A0%ED%8A%B8%EC%95%A4%EB%93%9C+%EA%B0%9C%EB%B0%9C%ED%99%98%EA%B2%BD) 
예제를 참고해서 작성한 샘플입니다.  
ES6로 코드 작성하고 브라우저 새로 고침으로 바로 확인 가능합니다.


## 요구사항:


    Node.js - 실시간으로 트랜스파일이 가능한 개발환경의 기반이 됩니다.
    Electron - 구글 크롬 브라우저에서 import(require)문을 직접 이용하는 데 필요합니다.
    ** Electron 버전은 [0.36.10] 이하 버전으로 설치 해야 합니다. (Windows 0.37.4 버전에서 오류로 실행이 안됩니다.)
    Babel - ES6, ES7, JSX등 차세대 자바스크립트 코드를 구사하기 위해 사용합니다.
    ESLint - 코드 스타일을 안내해주고, 빈번히 발생하는 개발 실수를 줄여줍니다.
    Webpack - 프로덕션 빌드 과정에서 모듈 패키징에 사용됩니다.
    Jest - 자바스크립트 유닛 테스트의 고통을 덜 수 있습니다.
    Nightwatch.js - 구글 크롬 외 다른 브라우저에서의 작동 여부를 테스트하고 자동화를 위해 사용합니다.
    Grunt - 이 모든 과정을 수월하게 관리할 수 있도록 도와주는 태스크 매니저입니다.
    
    
## 실행:


    npm install
    npm start
    
    