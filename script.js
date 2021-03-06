// youtube request

//tastdive url example https://tastedive.com/api/similar?q=The+beatles&type=music
//figure out a way to turn spaces into "+"

// example embed youtube just replace the src ending <iframe width="560" height="315" src="https://www.youtube.com/embed/cSp1dM2Vj48" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

//Api Variables
let proxy = 'https://cors-anywhere.herokuapp.com/'
let willYoutubeKey = "&key=AIzaSyBrYHBqo3A_fYmsS9pr_20BBEgc52EOS30";
let timYoutubeKey = '&key=AIzaSyB74P7MbJivLatohgQSTjmszeLh-DyJP5Y';
let tasteDivKey = '&k=389155-Bootcamp-98L8X8SY'
let youtubeApiUrl = "https://www.googleapis.com/youtube/v3/search?q=";
let tasteDiveApiUrl = "https://tastedive.com/api/similar?q=";

//DOM Elements Variables
let searchInput = $('#search-input');
let videoDiv = $('#video-div');
let pastSearchDiv = $('#past-searches');

let searchTerm = "";

/**
 * Called when text is entered and submit button is clicked
 * 1. Validates text
 * 2. Adds search result to localStorage
 * 3. Calls tasteDive api requesting similar artists
 * 4. Calls youtube api loading videos for similar artists
 * */
$(function() {
	const onSearch = async (searchText) => {
		//Reset the DOM
		resetEmbeddedVideos();
	
		//Validate search, just trim? Don't know what else we can really validate
		searchText = searchText.trim();
	
		//Call taste dive passing in the artist, saving the results for similar artists to a variable
		//Save the results for similar artists from tasteDive in a variable
		let similarArtists = await tasteDiveApiCall(searchText);
		console.log(similarArtists);
		
		//If there were no results just return rather than calling the youtube api
		if (similarArtists.length < 1)
		{
			buildRick();
			return;
		}
		else
		{
			searchInput.val('');
			saveSearchToLocalStorage(searchText);
			displaySavedSearches();

			//Call youtube api, search for videos from the top 3? similar artists
			for(i = 0; i < 5; i++)
			{
				let name = similarArtists[i].Name;
				let videos = await youtubeSearchApiCall(name);
			
				//Add the first video to the DOM
				video = videos.items.filter(item => item.id.videoId)[0];
				console.log("video", video);
				let iframe = $('<iframe allowfullscreen>').attr('src', 'https://www.youtube.com/embed/' + video.id.videoId);
				iframe.attr('width', '560').attr('height', '315');
				iframe.attr('frameborder', '0').attr('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
				videoDiv.append(iframe);
		
				let linkCol = $('<div>').addClass('col');
				let link = $("<a>").attr('href', 'https://www.youtube.com/watch?v=' + video.id.videoId).text("Alternate Youtube Link");
				link.addClass('pl-3 pb-5');
				linkCol.append(link);
				videoDiv.append(linkCol);
			}
		}
	};
	
	/**
	 * Call tasteDive's API searching for an artists similar to the artist passed in.
	 * Return the results
	 */
	const tasteDiveApiCall = async (searchText) => {
		//Build the url
		let url = proxy + tasteDiveApiUrl + searchText + "&type=music" + tasteDivKey;
		console.log(url);
	
		//Ajax call to the built URL, wait for a response, then return it
		let result = await $.ajax( {url: url, method: 'GET' } ).then( res => {
			//Return the response from the call
			return res.Similar.Results;
		}).catch(error => {
			buildRick();
			console.error(error);
		});
		return result;
	};
	
	/**
	 * Call Youtube's API searching for videos artist passed in.
	 * Return the results
	 */
	const youtubeSearchApiCall = async (artist) => {
		//Build the url
		let url = youtubeApiUrl + artist + willYoutubeKey;
	
		//Ajax call to the built URL, wait for a response, then return it
		return await $.ajax( {url: url, method: 'GET'} ).then( res => {
			//Return the response from the call
			return res;
		}).catch(error => {
			buildRick();
			
			console.error(error);
			return [];
		});
	};
	
	/**
	 * Make api calls
	 */
	const apiCall = (url, callbackFunction) => {
		$.ajax( {url: url, method: 'GET'}).then(res => {
			
		});
	};

	const buildRick = () => {
		let rickRollP = $("<a>").attr('href', 'https://www.youtube.com/watch?v=oHg5SJYRHA0').text('An error occurred, click here to enjoy the coolest song ever.');
		$('#video-div').append(rickRollP);
	};
	
	/*
	 * Resete the video div, just emptys the div
	 */
	const resetEmbeddedVideos = () => {
		videoDiv.empty();
	};
	
	let storedSearchHistory = JSON.parse(localStorage.getItem("Past Searches")) || [];
	/**
	 * Adds search text to array in localstorage
	 */
	const saveSearchToLocalStorage = (searchText) => {
		if(!storedSearchHistory.includes(searchText))
		{
			if(storedSearchHistory.length === 9)
				storedSearchHistory.splice(0, 1);
				
			storedSearchHistory.push(searchText);
		    localStorage.setItem("Past Searches", JSON.stringify(storedSearchHistory ));
		}
	};
	
	/**
	 * Retrieves array of searches from localStorage
	 * Adds to the DOM
	 */
	const displaySavedSearches = () => {
		$("#searchHistory").empty();
	    for (i = 0; i < storedSearchHistory.length; i++) {
	        var hist = $("<li>").addClass('past-search list-group-item'); //document.createElement("P");  
			let text = storedSearchHistory[i];
	
			hist.attr('data-text', text);

			hist.on('click', pastSearchClicked);
	
	        hist.text(text);
	        //add a search history div with this ID
			$('#searchHistory').append(hist);
	//         document.getElementById("searchHistory").appendChild(hist); 
	        
	    }
	};
	
	/**
	 * Event Handling
	 */
	$(searchInput).on('keypress', function(event) {
		//Check if the enter key was pressed
		if(event.keyCode === 13)
		{
			//Get the value of the search input and call onSearch(searchText);
			let searchText = $(event.currentTarget).val();
			onSearch(searchText);
		}
	});
	
	/**
	 * When past search is clicked re do the search
	 * @param {*} el 
	 */
	const pastSearchClicked = (el) => {
		onSearch($(el.currentTarget).attr('data-text'));
	};

	//Do the search again when a past search is clicked on
	// $('.past-search').on('click', function() {
	// 	alert("search clicked");
	// 	// alert('past search clcked', $(this).attr('data-text'));
	// 	onSearch($(this).attr('data-text'));
	// });
	
	displaySavedSearches();
});
