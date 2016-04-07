function plate(canvas) {
    var obj = {
        origin : 3,
        division : 2,
        multiplier : 3,
        start : 0,
        length : 5
    }
    var context = canvas.getContext('2d');
    var platewidth = 0;
    var plateheight = 0;
    var viewX = 0;
    var viewY = 0;
    var viewWidth = canvas.width;
    var viewHeight = canvas.height;
    var gridDef = 20;
    var gridHeight = 100;
    var points = [];
    var position = [[]];
    var vgridnum = 300;
    var hgridnum = 20;
    var vgrid = [];
    var hgrid = [];
    var focusGrid_x = -1;
    var focusGrid_y = -1;
    var focusCell_x = -1;
    var focusCell_y = -1;
    var vx = 0;
    var vy = 0;
    var FC = {
        xp : [], yp : [],
        A : [], B : [], C : [], D : [], E:[],
        norm1 : -1,
        norm2 : -1,
        norm3 : -1
    };
    var focusType = {
        Cross : 0,
        Grid : 1,
        Cell : 2
    };
    var setFeelCurve = function() {
        var n = FC.xp.length-1;
        var w = [];
        var h = [];
        var ftt = [];
        var i, j;
        var x = 0;
        var vals;
        for (i=0; i<n; i++)
        {
            w[i] = (FC.xp[i+1]-FC.xp[i]);
            h[i] = (FC.yp[i+1]-FC.yp[i])/w[i];
        }
        ftt[0] = 0;
        for (i=0; i<n-1; i++)
            ftt[i+1] = 3*(h[i+1]-h[i])/(w[i+1]+w[i]);
        ftt[n] = 0;
        for (i=0; i<n; i++)
        {
            FC.A[i] = (ftt[i+1]-ftt[i])/(6*w[i]);
            FC.B[i] = ftt[i]/2;
            FC.C[i] = h[i]-w[i]*(ftt[i+1]+2*ftt[i])/6;
            FC.D[i] = FC.yp[i];
        }
        for(i=0 ; i<vgridnum ; x += vgrid[i++])
        {
            for(j=0 ; j<n ; j++)
            {
                if(FC.xp[j]<=x && x<FC.xp[j+1])
                {
                    vals = fval(FC.A[j],FC.B[j],FC.C[j],FC.D[j],x-FC.xp[j]);
                    break;
                }
            }
            if(FC.norm1<Math.abs(vals.val1))
                FC.norm1 = Math.abs(vals.val1);
            if(FC.norm2<Math.abs(vals.val2))
                FC.norm2 = Math.abs(vals.val2);
            if(FC.norm3<Math.abs(vals.val3))
                FC.norm3 = Math.abs(vals.val3);
        }
    };
    var fval = function(a,b,c,d,xi)
    {
        var val1, val2, val3;
        val1 = a*xi*xi*xi + 
            b*xi*xi + 
            c*xi + 
            d;
        val2 = 3 * a*xi*xi + 
            2 * b*xi + 
            c;
        val3 = 6 * a*xi + 
            2 * b;
        return { val1,val2,val3 };
    };
    var drawLine = function(x1, y1, x2, y2, ctx)
    {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
    var drawCurve = function() {
        var i, j;
        var n = FC.xp.length;
        var x = 0;
        var vals;
        var h = canvas.height/2;
        var px =0 , pv1=0, pv2=0, pv3=0;
        x = 0;
        for(i=0 ; i<vgridnum ; x += vgrid[i++])
        {
            for(j=0 ; j<n ; j++)
            {
                if(FC.xp[j]<=x && x<FC.xp[j+1])
                {
                    vals = fval(FC.A[j],FC.B[j],FC.C[j],FC.D[j],x-FC.xp[j]);
                    break;
                }
            }
            vals.val1 /= FC.norm1;
            vals.val2 /= FC.norm2;
            vals.val3 /= FC.norm3;
            context.strokeStyle = 'orange';
            drawLine(viewX + px,h + pv1,viewX + x,h + vals.val1*h*0.8,context);
            context.strokeStyle = 'red';
            drawLine(viewX + px,h + pv2,viewX + x,h + vals.val2*h*0.5,context);
            context.strokeStyle = 'green';
            drawLine(viewX + px,h + pv3,viewX + x,h + vals.val3*h*0.4,context);
			px = x;
			pv1 = vals.val1*h*0.8;
			pv2 = vals.val2*h*0.5;
			pv3 = vals.val3*h*0.4;
        }
    };
    var drawGrid = function() {
        var i, j;
        var sw;
        var sh;
        var x, y;
        var ew = (viewX + platewidth) < viewWidth ? (viewX + platewidth) : viewWidth;
        var eh = (viewY + plateheight) < viewHeight ? (viewY + plateheight) : viewHeight;
        context.strokeStyle = '#282828';
        context.fillStyle = '#66EE66';
        for(i=0, x=0, sw=viewX ; sw>0 ; x = i, sw += vgrid[i++]);
        for(i=0, y=0, sh=viewY ; sh>0 ; y = i, sh += hgrid[i++]);
        for (i = sw ; i<ew ; i+=vgrid[x++])
        {
            if(x == focusGrid_x)
                context.lineWidth = 3;
            else
                context.lineWidth = 1;
            drawLine(i,viewY,i,eh,context);
        }
        for (i = sh ; i<eh ; i+=hgrid[y++])
        {
            if(y == focusGrid_y)
                context.lineWidth = 3;
            else
                context.lineWidth = 1;
            drawLine(viewX,i,ew,i,context);
        }
    };
    var drawPoint = function() {
        var i, j;
        var x, y;
        for(i=0 ; i<points.length ; i++)
        {
            x = 0;
            y = 0;
            for(j=0 ; j<points[i].cx ; j++)
                x+=vgrid[j];
            for(j=0 ; j<points[i].cy ; j++)
                y+=hgrid[j];
            x += viewX;
            y += viewY;
			context.fillStyle = "orange";
			context.fillRect(x-5, y-5, 10, 10);
        }
    };
    var invalidate = function()
    {
        context.clearRect(0,0,viewWidth,viewHeight);
        drawCurve();
        drawGrid();
        drawPoint();
    };
    var setPosition = function(x, y)
    {
        viewX = x;
        viewY = y;
        if(viewX>0)
            viewX = 0;
        else if(viewX + platewidth < viewWidth)
            viewX = viewWidth - platewidth;
        if(viewY>0)
            viewY = 0;
        else if(viewY + plateheight < viewHeight)
            viewY = viewHeight - plateheight;
        invalidate();
    };
    var drift = function()
    {
        var d = Math.sqrt(vx*vx + vy*vy);
        if(d>1)
        {
            setPosition(viewX+vx,viewY+vy);
            vx *= 0.90;
            vy *= 0.90;
            window.requestAnimationFrame(drift);
        }
        else
            vx = vy = 0;
    };
    this.focusPoint = function(x, y)
    {
        var fx=0, fy=0;
        var i;
        var d = 5;
        var b = 0;
        focusGrid_x = focusGrid_y = -1;
        for(i=0 ; i<vgridnum ; i++)
        {
            if(x>=fx-d && x<=fx+d)
            {
                focusGrid_x = i;
                b++;
            }
            else if(x>=fx && x<=fx+vgrid[i])
            {
                focusCell_x = i;
            }
            fx+=vgrid[i];
        }
        for(i=0 ; i<hgridnum ; i++)
        {
            if(y>=fy-d && y<=fy+d)
            {
                focusGrid_y = i;
                b++;
            }
            else if(y>=fy && y<=fy+hgrid[i])
            {
                focusCell_y = i;
            }
            fy+=hgrid[i];
        }
        invalidate();
    };
    this.action = function(sx, sy, fx, fy)
    {
        var isVcross, isHcross;
        var isPoint;
    }
    this.getLocationX = function()
    {
        return viewX;
    };
    this.getLocationY = function()
    {
        return viewY;
    };
    this.setPosition = function(x, y)
    {
        setPosition(x,y);
    };
    this.throwplate = function(x,y)
    {
        vx = x;
        vy = y;
        window.requestAnimationFrame(drift);
    };
    this.deletePoint = function(x,y)
    {
        var i;
        for(i=0 ; i<points.length ; i++)
        {
            if(points[i].cx == x && points[i].cy == y)
            {
                points.splice(i,1);       
            }
        }
        invalidate();
    };
    this.init = function()
    {
        var i;
        var n = Math.round(4+Math.random()*5);
        for(i=0 ; i<vgridnum ; i++)
        {
            vgrid[i] = gridDef;
            platewidth += gridDef;
        }
        for(i=0 ; i<hgridnum ; i++)
        {
            hgrid[i] = gridHeight;
            plateheight += gridHeight;
        }
        for(i=0 ; i<n ; i++)
        {
            FC.xp[i] = Math.round(platewidth / n * i);
            FC.yp[i] = Math.round(2 * Math.random() - 1);
        }
        FC.xp[n] = platewidth;
        FC.yp[0] = 0;
        FC.yp[n] = 0;
        setFeelCurve();
        invalidate();
    };
    this.addPoint = function(x, y) {
        var cx, cy;
        var i, xx=0, yy=0;
        for(i=0 ; i<vgridnum-1 ; i++)
        {
            if(x>=xx & x<xx+vgrid[i])
            {
                cx = (x-xx)<(xx+vgrid[i]-x)?i:i+1;
                break;
            }
            xx+=vgrid[i];
        }
        for(i=0 ; i<hgridnum-1 ; i++)
        {
            if(y>=yy & y<yy+hgrid[i])
            {
                cy = (y-yy)<(yy+hgrid[i]-y)?i:i+1;
                break;
            }
            yy+=hgrid[i];
        }
        if(position[cx] == undefined)
        {
            points = points.concat({cx,cy});
            position[cx] = [];
            position[cx][cy] = 1;
        }
        else
        {
            if(position[cx][cy]==1)
            {
                position[cx][cy] = undefined;
                this.deletePoint(cx,cy);
            }
            else
            {
                points = points.concat({cx,cy});
                position[cx][cy] = 1;
            }
        }
        invalidate();
    };
}