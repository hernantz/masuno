+1
===

At [@machinalis](https://twitter.com/machinalis) we have the
rite to cook and share our meals, anyone that wants have lunch
with the rest must write a "+1" on the IRC to be counted.


![+1](http://i.imgur.com/93tPJCw.png)


This project aims to simplify the calculation of costs and determine
who pays how much.
It has been [forked](https://github.com/dmoisset/almuerzomatic) from
an example angular app that @dmoisset made for learning purposes.


I've tried to apply the ideas behind [locche](https://github.com/ralsina/locche),
and have an easy way to share the meal costs without requiring a server for that.
But because the way AngularJS works (as far as I know) the rendered template cannot
be shared, so I started a [MarionetteJS](http://marionettejs.com/) version to
have more control over templates. Sadly there is a limit on how large a url can be,
and base64 encoding is pretty verbose, so the MarionetteJS version was not an option
either.


I decided to put an end to this experiment and leave the MarionetteJS version.
[Click here for a demo](https://hernantz.github.com/masuno)
