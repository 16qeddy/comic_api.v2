import React, { Component } from "react";
import axios from 'axios';
import ReactDOM from "react-dom";
import { Button, Card, Navbar, Nav, NavDropdown, FormControl, Form, Spinner } from 'react-bootstrap';
import '../styles/app.css';
import SeriesCard from './seriesCard.js';
import SeriesView from './seriesView.js';
import SearchNav from './searchNav.js';
import ChapterView from './chapterView.js';
class App extends Component {
  constructor() {
    super();

    this.state = {
      comicList: [],
      loading: false,
      search: '',
      series: null,
      chapter: null,
      nextChapter: null
    };
    this.toggleLoading = this.toggleLoading.bind(this);
    this.getComics = this.getComics.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.seriesOnClick = this.seriesOnClick.bind(this);
    this.goHome = this.goHome.bind(this);
    this.chapterClick = this.chapterClick.bind(this);
    this.goBack = this.goBack.bind(this);
    this.searchOnKeyUp = this.searchOnKeyUp.bind(this);
    this.nextChapterOnClick = this.nextChapterOnClick.bind(this);
  }

  componentDidMount() {
    this.getComics('carnage');
  }

  toggleLoading() {
    this.setState({
      loading: !this.state.loading
    })
  }

  getComics(query) {
    let comics = [];
    this.toggleLoading();
    axios.get(`https://fast-bayou-41832.herokuapp.com/api/search-comic/${query}`)
      .then((data) => {
        this.setState({
          comicList: data.data,
          search: '',
          series: null,
          chapter: null,
          nextChapter: null
        })
        this.toggleLoading();
      })
  }

  searchOnKeyUp(e){
    console.log(e.key);
    if(e.key === 'Enter'){
      this.onSubmit();
    } else {
      this.setState({
        search: e.target.value
      })
    }
  }

  onSubmit() {
    this.getComics(this.state.search);
  }

  seriesOnClick(comicSeries) {
    this.setState({
      series: comicSeries
    })
  }

  goHome() {
    this.setState({
      loading: false,
      search: '',
      series: null,
      chapter: null,
      nextChapter: null
    })
  }

  chapterClick(chapterURL, index) {
    this.toggleLoading();
    let next = this.state.series.chapters[index - 1] ? [this.state.series.chapters[index - 1].url, index - 1] : null;
    axios.get(chapterURL)
      .then(data => {
        this.setState({
          chapter: data.data,
          nextChapter: next
        })
      })
      .then(() => {
        this.toggleLoading();
      })
      .catch(err => {
        console.log(err);
      })
  }

  goBack() {
    if (this.state.chapter) {
      this.setState({
        chapter: null
      })
    }
    else if (this.state.series) {
      this.setState({
        series: null
      })
    }
  }
  nextChapterOnClick(){
    if(this.state.nextChapter){
      this.chapterClick(this.state.nextChapter[0], this.state.nextChapter[1]);
    } else {
      this.goBack();
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="loadingFrame">
          <div className="top"></div>
          <div class='loading'>
            <div class="blackBox">
              Loading
            <Spinner animation="grow" variant="warning" />
              <Spinner animation="grow" variant="warning" />
              <Spinner animation="grow" variant="warning" />
            </div>
          </div>
          <div className="top"></div>
        </div>
      )
    }
    if (this.state.chapter) {
      return (
        <>
          <SearchNav onSubmit={this.onSubmit} searchOnKeyUp={this.searchOnKeyUp} goHome={this.goHome} goBack={this.goBack} nextChapterOnClick={this.nextChapterOnClick}/>
          <ChapterView chapter={this.state.chapter} />
        </>
      )
    }
    if (this.state.series) {
      return (
        <>
          <SearchNav onSubmit={this.onSubmit} searchOnKeyUp={this.searchOnKeyUp} goHome={this.goHome} goBack={this.goBack} />
          <SeriesView handler={this.chapterClick} series={this.state.series} />
        </>
      )
    }
    return (
      <div className="yellowText AppContainer">
         <SearchNav onSubmit={this.onSubmit} searchOnKeyUp={this.searchOnKeyUp} goHome={this.goHome} goBack={this.goBack} />
        <div className="comicSpace">
          <div className="sides"></div>
          <div className="center">
            {this.state.comicList.map((item) => {
              return <SeriesCard clickHandler={this.seriesOnClick} series={item} />
            })}
          </div>
          <div className="sides"></div>
        </div>
      </div>
    );
  }
}

export default App;
