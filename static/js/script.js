let { Component } = React;

class SlideShow extends Component {
  state = {
    activeIndex: 0,
    nextActiveIndex: 0,
    activeIndexClasses: ["active-slide"],
    nextActiveIndexClasses: [],
    disablePrevNext: false,
    xCoordinate: null
  };
  // used to detect slider direction when clicking the buttons to change slides
  direction = "to-left";
  // how long a slide will be displayed
  slideTimeOut = this.props.activeSlideDuration
    ? this.props.activeSlideDuration
    : 3000;
  /*will be used to reset classes after animating the transition from a slide to another
        (it has to be equal to the animation duration in the css
        classes [enter-to-left, exit-to-left, enter-to-right, exit-to-right])*/
  animationDuration = 600;
  // will be used to auto play the carousel
  autoSlide;
  // will be used to set the interaction mode (swipe or hover)
  interactionMode = this.props.interactionMode
    ? this.props.interactionMode
    : "swipe";

  componentDidMount() {
    this.startAutoSliding();
  }

  componentWillUnmount() {
    this.stopAutoSliding();
  }

  // used to unify the touch and click cases
  unify = e => (e.changedTouches ? e.changedTouches[0] : e);

  // get and set the x coordinate
  getSetXCoordinate = e =>
    this.setState({ xCoordinate: this.unify(e).clientX });

  // move the slide based on the swipe direction
  moveSlide = e => {
    const {xCoordinate} = this.state;
    if (xCoordinate || xCoordinate === 0) {
      let dx = this.unify(e).clientX - xCoordinate,
        s = Math.sign(dx);
      if (s < 0) {
        this.nextSlide();
      } else if (s > 0) {
        this.prevSlide();
      }
    }
  };

  // show the next slide in the view port based on the direction
  animateSliding = () => {
    let activeIndexClasses = [];
    let nextActiveIndexClasses = [];

    // attach the following classes if the user click the next button
    if (this.direction === "to-left") {
      activeIndexClasses.push("active-slide", "exit-to-left");
      nextActiveIndexClasses.push(
        "active-slide",
        "next-active-slide",
        "enter-to-left"
      );
    } else {
      // attach the following classes if the user click the prev button
      activeIndexClasses.push("active-slide", "exit-to-right");
      nextActiveIndexClasses.push(
        "active-slide",
        "next-active-slide",
        "enter-to-right"
      );
    }

    this.setState({
      activeIndexClasses: activeIndexClasses,
      nextActiveIndexClasses: nextActiveIndexClasses
    });
  };

  // start auto sliding
  startAutoSliding = () => {
    const {autoPlay} = this.props;
    
    this.autoSlide = autoPlay
      ? setInterval(this.nextSlide, this.slideTimeOut)
      : null;
  };

  // stop auto sliding
  stopAutoSliding = () => {    
    clearInterval(this.autoSlide);
  };

  // used to restart auto sliding when user click prev, next button or on the carousel indicator
  restartAutoSliding = nextAcIn => {
    this.setState({
      nextActiveIndex: nextAcIn,
      disablePrevNext: true
    });

    // attach the required classes to animate the transition between slides
    this.animateSliding();

    // reset classes and enable prev & next btns after the animation duration
    this.setActiveSlide(nextAcIn);

    // restart auto sliding
    this.startAutoSliding();
  };

  // reset classes after the animation duration and enable prev & next btns
  setActiveSlide = nextActiveI => {
    setTimeout(() => {
      this.setState({
        activeIndex: nextActiveI,
        activeIndexClasses: ["active-slide"],
        nextActiveIndexClasses: [],
        disablePrevNext: false
      });
    }, this.animationDuration);
  };

  nextSlide = () => {
    const {activeIndex} = this.state;
    const {children} = this.props;       
    
    //stop auto sliding (so that when user click the next button we can reset the timer for auto sliding)
    this.stopAutoSliding();

    // set direction to left because slide is coming from the right side to the view port
    this.direction = "to-left";

    // set the next active index
    let nextActiveI = activeIndex + 1;   

    // if the we reach the last slide reset the next active index to 0
    if (nextActiveI === children.length) {
      nextActiveI = 0;
    }

    // restart auto sliding
    this.restartAutoSliding(nextActiveI);
  };

  prevSlide = () => {
    const {activeIndex} = this.state;
    const {children} = this.props;
    
    //stop auto sliding (so that when user click the prev button we can reset the timer for auto sliding)
    this.stopAutoSliding();

    // set direction to right because slide is coming from the left side to the view port
    this.direction = "to-right";

    // set the next active index
    let nextActiveI = activeIndex - 1;

    // if we are at the first slide set the next active index to the last slide
    if (nextActiveI < 0) {
      nextActiveI = children.length - 1;
    }

    // restart auto sliding
    this.restartAutoSliding(nextActiveI);
  };

  onCarouselIndecator = index => {
    const {activeIndex} = this.state;
    
    //stop auto sliding
    this.stopAutoSliding();

    // set the next active index
    let nextActiveI = index;

    // set the direction of the carousel based on the clicked indicator index
    if (nextActiveI < activeIndex) {
      this.direction = "to-right";
    } else {
      this.direction = "to-left";
    }

    // restart auto sliding
    this.restartAutoSliding(nextActiveI);
  };

  render() {
    const {
      activeIndex,
      nextActiveIndex, //innerNextActiveIndex
      activeIndexClasses, //innerActiveIndexClasses
      nextActiveIndexClasses, //innerNextActiveIndexClasses
      disablePrevNext
    } = this.state;
    
    const {
      alignIndicators,
      alignCaption,
      useRightLeftTriangles,
      leftTriangleColor,
      leftIcon,
      rightTriangleColor,
      rightIcon,
      indicatorsColor,
      interactionMode,
      children
    } = this.props;

    // use it to set the indicator position based on the coming props
    let indicatorPosition = "position-center";
    
    if (alignIndicators === "right") {
      indicatorPosition = "position-right";
    } else if (alignIndicators === "left") {
      indicatorPosition = "position-left";
    }

    return (
      <div
        className="carousel-slider-wrapper"
        style={{
          cursor: interactionMode === "swipe" ? "pointer" : ""
        }}
        onMouseDown={e => {
          if (this.interactionMode !== "swipe") {
            return;
          }
          this.getSetXCoordinate(e);
        }}
        onTouchStart={e => {
          if (this.interactionMode !== "swipe") {
            return;
          }
          this.getSetXCoordinate(e);
        }}
        onMouseUp={e => {
          if (disablePrevNext || this.interactionMode !== "swipe") {
            return;
          }
          this.moveSlide(e);
        }}
        onTouchEnd={e => {
          if (disablePrevNext || this.interactionMode !== "swipe") {
            return;
          }
          this.moveSlide(e);
        }}
        onMouseMove={e => {
          if (this.interactionMode !== "swipe") {
            return;
          }
          e.preventDefault();
        }}
        onTouchMove={e => {
          if (this.interactionMode !== "swipe") {
            return;
          }
          e.preventDefault();
        }}
      >
        {/*(onMouseDown & onTouchStart) & (onMouseUp & onTouchEnd) used to detect the motion direction*/}
        {/*(onMouseMove & onTouchMove) used to prevent edge from navigating the
                 opposite motion direction (also sometimes on chrome)*/}
        {children.map((el, i) => {
          let classes = "";
          
          if (i === activeIndex) {
            classes = activeIndexClasses.join(" ");
          } else if (i === nextActiveIndex) {
            classes = nextActiveIndexClasses.join(" ");
          }
          
          const swipeClass =
            interactionMode === "swipe" ? "swipe" : "";
          
          return (
            <div
              key={i}
              className={`carousel-slide ${classes} ${swipeClass}`}
              style={{ textAlign: alignCaption }}
              // the following events to pause the auto slide on hover
              onMouseEnter={() => {
                if (this.interactionMode !== "hover") {
                  return;
                }
                this.stopAutoSliding();
              }}
              onMouseLeave={() => {
                if (this.interactionMode !== "hover") {
                  return;
                }
                this.startAutoSliding();
              }}
            >
              {el.props.children}
            </div>
          );
        })}
        {/* carousel controls*/}
        <div className="carousel-left-arrow carousel-control">
          <div
            className={useRightLeftTriangles ? "left-triangle" : ""}
            style={{
              borderLeftColor: useRightLeftTriangles
                ? leftTriangleColor
                : ""
            }}
          />
          <button
            className={
              !useRightLeftTriangles ? "padding-left-15" : ""
            }
            disabled={disablePrevNext}
            onClick={() => {
              children.length !== 1 ? this.prevSlide() : null;
            }}
          >
            {leftIcon ? (
              leftIcon
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
                <path d="M231.293 473.899l19.799-19.799c4.686-4.686 4.686-12.284 0-16.971L70.393 256 251.092 74.87c4.686-4.686 4.686-12.284 0-16.971L231.293 38.1c-4.686-4.686-12.284-4.686-16.971 0L4.908 247.515c-4.686 4.686-4.686 12.284 0 16.971L214.322 473.9c4.687 4.686 12.285 4.686 16.971-.001z" />
              </svg>
            )}
          </button>
        </div>
        <div className="carousel-right-arrow carousel-control">
          <div
            className={useRightLeftTriangles ? "right-triangle" : ""}
            style={{
              borderRightColor: useRightLeftTriangles
                ? rightTriangleColor
                : ""
            }}
          />
          <button
            className={
              !useRightLeftTriangles ? "padding-right-15" : ""
            }
            disabled={disablePrevNext}
            onClick={() => {
              children.length !== 1 ? this.nextSlide() : null;
            }}
          >
            {rightIcon ? (
              rightIcon
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
                <path d="M24.707 38.101L4.908 57.899c-4.686 4.686-4.686 12.284 0 16.971L185.607 256 4.908 437.13c-4.686 4.686-4.686 12.284 0 16.971L24.707 473.9c4.686 4.686 12.284 4.686 16.971 0l209.414-209.414c4.686-4.686 4.686-12.284 0-16.971L41.678 38.101c-4.687-4.687-12.285-4.687-16.971 0z" />
              </svg>
            )}
          </button>
        </div>
        {/*carousel indicators*/}
        <ol className={`carousel-indicators ${indicatorPosition}`}>
          {children.map((el, i) => (
            <li
              key={i}
              className={i === nextActiveIndex ? "active" : ""}
              style={
                indicatorsColor
                  ? {
                      borderColor: indicatorsColor,
                      backgroundColor:
                        i === nextActiveIndex
                          ? indicatorsColor
                          : "",
                      ":hover": {
                        backgroundColor: indicatorsColor,
                        opacity: i === nextActiveIndex ? 1 : 0.7
                      }
                    }
                  : {}
              }
              onClick={() => {
                children.length !== 1
                  ? this.onCarouselIndecator(i)
                  : null;
              }}
            />
          ))}
        </ol>
      </div>
    );
  }
}

// used for inline styles with pseudo selectors
// Note the following line just for codepen and if you open the devTool you will see an error. to solve this error see the next comment
SlideShow = Radium(SlideShow);
// to use it in your app replace the previous line with the following
// - export default Radium(SlideShow);

const app = (
  <div className="text-center container">
    {/*slideshow properties:
    - autoPlay => can be ture, false (default: false)
    - activeSlideDuration => can be in milliseconds (default: 3000)
    - interactionMode => can be:
    (swipe => change slides by swiping to right or left) or
    (hover => pause a slide on hover)
    (default is swipe)
    - alignCaption => can be center, left, right (default: center)
    - alignIndicators => can be center, left, right (default: center)
    - indicatorsColor => allows you to change the indicators color (default: #fff) 
    - useRightLeftTriangles => can be true or false (defalut: false) 
    - rightTriangleColor or leftTriangleColor => set the background color of the right and the left triangles (default: #fff)
    - rightIcon or leftIcon => set the right or left icon (it can be "svg" or "fontawesome icon") if you want to change the color use inline styles on the icon as follow:
    (for svg) =>  style={{fill: "#000"}} defalut is black
    (for fontawesome) => style={{color: "#000"}} default is black (don't forget to add fontawesome to your project) */}
    <h3>React Slide show</h3>
    <SlideShow
      autoPlay={true}
      activeSlideDuration={3000}
      interactionMode="swipe"
      alignCaption="center"
      alignIndicators="center"
      indicatorsColor="#fff"
      useRightLeftTriangles={true}
      rightTriangleColor="#fff"
      leftTriangleColor="#fff"
      rightIcon={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
          <path d="M24.707 38.101L4.908 57.899c-4.686 4.686-4.686 12.284 0 16.971L185.607 256 4.908 437.13c-4.686 4.686-4.686 12.284 0 16.971L24.707 473.9c4.686 4.686 12.284 4.686 16.971 0l209.414-209.414c4.686-4.686 4.686-12.284 0-16.971L41.678 38.101c-4.687-4.687-12.285-4.687-16.971 0z" />
        </svg>
      }
      leftIcon={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
          <path d="M231.293 473.899l19.799-19.799c4.686-4.686 4.686-12.284 0-16.971L70.393 256 251.092 74.87c4.686-4.686 4.686-12.284 0-16.971L231.293 38.1c-4.686-4.686-12.284-4.686-16.971 0L4.908 247.515c-4.686 4.686-4.686 12.284 0 16.971L214.322 473.9c4.687 4.686 12.285 4.686 16.971-.001z" />
        </svg>
      }
    >
      <div>
        <img src="https://picsum.photos/id/1/1280/500" />
        <div className="carousel-caption">
          <h3 className="carousel-caption-title">Frist title</h3>
          <p className="carousel-caption-subtitle">First subtitle</p>
        </div>
      </div>
      <div>
        <img src="https://picsum.photos/id/234/1280/500" />
        <div className="carousel-caption">
          <h3 className="carousel-caption-title">Second title</h3>
          <p className="carousel-caption-subtitle">Second subtitle</p>
        </div>
      </div>
      <div>
        <img src="https://picsum.photos/id/790/1280/500" />
        <div className="carousel-caption">
          <h3 className="carousel-caption-title">Third title</h3>
          <p className="carousel-caption-subtitle">Third subtitle</p>
        </div>
      </div>
    </SlideShow>
  </div>
);

ReactDOM.render(app, document.querySelector("#app"));

